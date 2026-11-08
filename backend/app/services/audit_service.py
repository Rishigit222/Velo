"""
Tamper-evident audit logging service and cryptographic chain-of-custody engine.
"""
from datetime import datetime, timezone
import hashlib
import json
import threading
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.audit_log import AuditLog
from backend.app.schemas.evidence import AuditVerificationResponse

# Process-level concurrency lock to serialize audit chain calculation
_audit_lock = threading.RLock()


class AuditEventType:
    EVIDENCE_SESSION_CREATED = "EVIDENCE_SESSION_CREATED"
    FILE_UPLOADED = "FILE_UPLOADED"
    CONDITION_REPORT_SUBMITTED = "CONDITION_REPORT_SUBMITTED"
    FILE_DOWNLOADED = "FILE_DOWNLOADED"
    SESSION_STATUS_CHANGED = "SESSION_STATUS_CHANGED"
    DISPUTE_CREATED = "DISPUTE_CREATED"
    DISPUTE_MOVED_TO_REVIEW = "DISPUTE_MOVED_TO_REVIEW"
    DISPUTE_STATUS_CHANGED = "DISPUTE_STATUS_CHANGED"
    DISPUTE_RESOLVED = "DISPUTE_RESOLVED"
    DISPUTE_REJECTED = "DISPUTE_REJECTED"
    REPORT_GENERATED = "REPORT_GENERATED"
    REPORT_DOWNLOADED = "REPORT_DOWNLOADED"
    VERIFICATION_COMPLETED = "VERIFICATION_COMPLETED"


def compute_deterministic_audit_hash(
    previous_hash: Optional[str],
    event_type: str,
    event_description: str,
    timestamp_iso: str,
    user_id: Optional[int] = None,
    order_id: Optional[int] = None,
) -> str:
    """
    Compute SHA-256 hash using deterministic pipe-delimited serialization.
    Maintains compatibility with AuditLog.compute_hash.
    """
    if user_id is not None or order_id is not None:
        data = f"{previous_hash or 'GENESIS'}|{event_type}|{user_id if user_id is not None else ''}|{order_id if order_id is not None else ''}|{event_description}|{timestamp_iso}".encode("utf-8")
    else:
        data = f"{previous_hash or 'GENESIS'}|{event_type}|{event_description}|{timestamp_iso}".encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def record_audit_event(
    db: Session,
    event_type: str,
    event_description: str,
    user_id: Optional[int] = None,
    order_id: Optional[int] = None,
    commit: bool = False,
) -> AuditLog:
    """
    Record an immutable, hash-linked audit record transactionally.
    Protected by a mutex lock to guarantee strict sequential hash continuity
    even during concurrent request execution.
    """
    with _audit_lock:
        # Fetch the most recent audit record to obtain the current chain tip
        stmt = select(AuditLog).order_by(AuditLog.id.desc()).limit(1)
        last_log = db.execute(stmt).scalar_one_or_none()

        previous_hash = last_log.current_hash if last_log else None
        now_dt = datetime.now(timezone.utc)
        # Deterministic ISO timestamp normalized to UTC without timezone suffix for database consistency
        timestamp_iso = now_dt.astimezone(timezone.utc).replace(tzinfo=None).isoformat()

        current_hash = compute_deterministic_audit_hash(
            previous_hash=previous_hash,
            event_type=event_type,
            event_description=event_description,
            timestamp_iso=timestamp_iso,
            user_id=user_id,
            order_id=order_id,
        )

        audit_entry = AuditLog(
            user_id=user_id,
            order_id=order_id,
            event_type=event_type,
            event_description=event_description,
            previous_hash=previous_hash,
            current_hash=current_hash,
            created_at=now_dt,
        )

        db.add(audit_entry)
        if commit:
            db.commit()
            db.refresh(audit_entry)
        else:
            db.flush()

        return audit_entry


def verify_audit_chain(
    db: Session,
    order_id: Optional[int] = None,
) -> AuditVerificationResponse:
    """
    Verify the integrity and continuity of the cryptographic audit chain.
    Detects:
    1. Broken hash links (missing or reordered records).
    2. Modified / tampered records (current_hash != computed hash).
    """
    with _audit_lock:
        stmt = select(AuditLog).order_by(AuditLog.id.asc())
        if order_id is not None:
            stmt = stmt.where(AuditLog.order_id == order_id)

        records: List[AuditLog] = list(db.execute(stmt).scalars().all())

        if not records:
            return AuditVerificationResponse(
                is_valid=True,
                total_records=0,
                verified_records=0,
                tampered_records=[],
                errors=[],
            )

        errors: List[str] = []
        tampered_ids: List[int] = []
        verified_count = 0

        # For global chain verification
        expected_previous_hash: Optional[str] = None if order_id is None else records[0].previous_hash

        for idx, log in enumerate(records):
            is_record_tampered = False

            # Normalize timestamp for cross-database driver deterministic representation
            clean_dt = log.created_at
            if clean_dt.tzinfo is not None:
                clean_dt = clean_dt.astimezone(timezone.utc).replace(tzinfo=None)

            candidate_timestamps = [
                clean_dt.isoformat(),
                log.created_at.isoformat(),
            ]
            if log.created_at.tzinfo is None:
                candidate_timestamps.append(log.created_at.replace(tzinfo=timezone.utc).isoformat())

            # 1. Check link continuity (only when checking global chain or from record 1+)
            if order_id is None:
                if log.previous_hash != expected_previous_hash:
                    errors.append(
                        f"Chain continuity broken at audit record ID {log.id}: "
                        f"expected previous hash '{expected_previous_hash}', found '{log.previous_hash}'."
                    )
                    is_record_tampered = True

            # 2. Check content hash integrity across candidate timestamps
            matched_hash = False
            computed_hashes = []
            for ts in candidate_timestamps:
                # Format A: with user_id and order_id
                hash_a = compute_deterministic_audit_hash(
                    previous_hash=log.previous_hash,
                    event_type=log.event_type,
                    event_description=log.event_description,
                    timestamp_iso=ts,
                    user_id=log.user_id,
                    order_id=log.order_id,
                )
                computed_hashes.append(hash_a)
                if hash_a == log.current_hash:
                    matched_hash = True
                    break

                # Format B: legacy 4-parameter format
                hash_b = compute_deterministic_audit_hash(
                    previous_hash=log.previous_hash,
                    event_type=log.event_type,
                    event_description=log.event_description,
                    timestamp_iso=ts,
                )
                computed_hashes.append(hash_b)
                if hash_b == log.current_hash:
                    matched_hash = True
                    break

            if not matched_hash:
                errors.append(
                    f"Cryptographic tampering detected at audit record ID {log.id}: "
                    f"stored hash '{log.current_hash}' does not match computed '{computed_hashes[0]}'."
                )
                is_record_tampered = True

            if is_record_tampered:
                tampered_ids.append(log.id)
            else:
                verified_count += 1

            expected_previous_hash = log.current_hash

        return AuditVerificationResponse(
            is_valid=len(tampered_ids) == 0 and len(errors) == 0,
            total_records=len(records),
            verified_records=verified_count,
            tampered_records=tampered_ids,
            errors=errors,
        )

"""
Storage Service supporting private Supabase Storage with local filesystem fallback.
"""
import os
from pathlib import Path
import time
from typing import Optional, Tuple
import uuid

from fastapi import HTTPException, status
import httpx

from backend.app.core.config import settings
from backend.app.utils.logger import get_logger

logger = get_logger(__name__)


class StorageService:
    """Unified storage provider: Supabase Storage or Local Filesystem."""

    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL.rstrip("/") if settings.SUPABASE_URL else None
        self.supabase_key = settings.SUPABASE_KEY
        self.bucket = settings.SUPABASE_STORAGE_BUCKET
        self.is_supabase_enabled = bool(self.supabase_url and self.supabase_key)

        if self.is_supabase_enabled:
            logger.info(f"StorageService initialized with Supabase Storage (bucket: '{self.bucket}')")
        else:
            logger.info("StorageService initialized with Local Filesystem Storage")

    def save_file(
        self,
        content: bytes,
        ext: str,
        mime_type: str = "application/octet-stream",
        subfolder: str = "evidence",
        upload_base_dir: Optional[str] = None,
    ) -> str:
        """
        Store binary payload into Supabase Storage if configured; otherwise local disk.
        Returns stored location identifier/path.
        """
        unique_filename = f"{uuid.uuid4().hex}_{int(time.time())}{ext}"

        if self.is_supabase_enabled:
            return self._save_to_supabase(content, unique_filename, mime_type, subfolder)
        else:
            return self._save_to_local(content, unique_filename, subfolder, upload_base_dir)

    def _save_to_supabase(self, content: bytes, filename: str, mime_type: str, subfolder: str) -> str:
        """Upload raw binary to private Supabase Storage bucket."""
        object_key = f"{subfolder}/{filename}"
        url = f"{self.supabase_url}/storage/v1/object/{self.bucket}/{object_key}"

        headers = {
            "Authorization": f"Bearer {self.supabase_key}",
            "apikey": self.supabase_key,
            "Content-Type": mime_type,
            "x-upsert": "true",
        }

        try:
            with httpx.Client(timeout=30.0) as client:
                res = client.post(url, headers=headers, content=content)
                if res.status_code in (200, 201):
                    logger.info(f"Uploaded file to Supabase Storage: {object_key}")
                    return f"supabase://{self.bucket}/{object_key}"
                else:
                    logger.error(f"Supabase upload failed [{res.status_code}]: {res.text}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Failed to persist file in Supabase Storage: {res.text}",
                    )
        except httpx.RequestError as exc:
            logger.error(f"Supabase Storage connection error: {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Unable to reach cloud storage provider.",
            )

    def _save_to_local(
        self,
        content: bytes,
        filename: str,
        subfolder: str,
        upload_base_dir: Optional[str] = None,
    ) -> str:
        """Save file to designated local directory."""
        base_dir = Path(upload_base_dir or settings.UPLOAD_DIR) / subfolder
        base_dir.mkdir(parents=True, exist_ok=True)

        target_path = (base_dir / filename).resolve()
        if not target_path.is_relative_to(base_dir.resolve()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Illegal file storage path attempt detected.",
            )

        with open(target_path, "wb") as f:
            f.write(content)

        return str(target_path)

    def get_file_bytes(self, file_path: str) -> bytes:
        """Retrieve binary content from Supabase Storage or local filesystem."""
        if file_path.startswith("supabase://"):
            parts = file_path.replace("supabase://", "").split("/", 1)
            bucket = parts[0]
            object_key = parts[1]
            url = f"{self.supabase_url}/storage/v1/object/{bucket}/{object_key}"

            headers = {
                "Authorization": f"Bearer {self.supabase_key}",
                "apikey": self.supabase_key,
            }

            try:
                with httpx.Client(timeout=30.0) as client:
                    res = client.get(url, headers=headers)
                    if res.status_code == 200:
                        return res.content
                    elif res.status_code == 404:
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND,
                            detail="Evidence file not found in cloud storage.",
                        )
                    else:
                        raise HTTPException(
                            status_code=status.HTTP_502_BAD_GATEWAY,
                            detail=f"Failed to retrieve file from cloud storage: {res.text}",
                        )
            except httpx.RequestError as exc:
                logger.error(f"Cloud storage connection error: {exc}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Cloud storage service unavailable.",
                )
        else:
            if not os.path.exists(file_path):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Evidence media payload is not present in local storage repository.",
                )
            with open(file_path, "rb") as f:
                return f.read()

    def get_signed_url(self, file_path: str, expires_in_seconds: int = 3600) -> Optional[str]:
        """Generate a temporary signed download URL for private Supabase objects."""
        if not (self.is_supabase_enabled and file_path.startswith("supabase://")):
            return None

        parts = file_path.replace("supabase://", "").split("/", 1)
        bucket = parts[0]
        object_key = parts[1]
        url = f"{self.supabase_url}/storage/v1/object/sign/{bucket}/{object_key}"

        headers = {
            "Authorization": f"Bearer {self.supabase_key}",
            "apikey": self.supabase_key,
            "Content-Type": "application/json",
        }

        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, headers=headers, json={"expiresIn": expires_in_seconds})
                if res.status_code == 200:
                    data = res.json()
                    signed_path = data.get("signedURL")
                    if signed_path:
                        return f"{self.supabase_url}/storage/v1{signed_path}"
        except Exception as exc:
            logger.warning(f"Failed to generate signed URL from Supabase: {exc}")

        return None


storage_service = StorageService()


"""
Thread-safe sliding-window in-memory rate limiter for brute-force protection.
"""
from collections import defaultdict
import threading
import time
from typing import Dict, List
from fastapi import HTTPException, Request, status


class SlidingWindowRateLimiter:
    """
    Sliding window rate limiter to protect sensitive endpoints from brute-force attacks.
    """
    def __init__(self, max_requests: int = 20, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = defaultdict(list)
        self._lock = threading.Lock()

    def check(self, identifier: str) -> None:
        """
        Check if identifier has exceeded the allowed rate.
        Raises HTTP 429 Too Many Requests if rate limit is exceeded.
        """
        now = time.time()
        window_start = now - self.window_seconds

        with self._lock:
            # Purge timestamps outside current sliding window
            timestamps = [ts for ts in self.requests[identifier] if ts > window_start]
            
            if len(timestamps) >= self.max_requests:
                retry_after = int(self.window_seconds - (now - timestamps[0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many requests. Rate limit exceeded. Try again in {retry_after} seconds.",
                    headers={"Retry-After": str(max(1, retry_after))},
                )

            timestamps.append(now)
            self.requests[identifier] = timestamps


# Default instance for authentication endpoints: 30 attempts per minute per IP
auth_rate_limiter = SlidingWindowRateLimiter(max_requests=30, window_seconds=60)


def rate_limit_auth(request: Request) -> None:
    """
    FastAPI dependency to rate limit authentication requests by client IP.
    """
    # Extract client IP; respects X-Forwarded-For if behind trusted proxy
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "127.0.0.1"

    auth_rate_limiter.check(f"auth:{client_ip}")


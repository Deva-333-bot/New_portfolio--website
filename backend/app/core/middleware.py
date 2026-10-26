import time
import uuid
from typing import Dict, List, Tuple
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings

class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id
        
        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        
        if settings.APP_ENV.lower() == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
            
        return response

class SimpleRateLimiter:
    """
    In-memory rate limiter per IP address for brute-force prevention on critical endpoints.
    """
    def __init__(self):
        # ip -> list of timestamps
        self.requests: Dict[str, List[float]] = {}

    def reset(self):
        self.requests.clear()

    def check_rate_limit(self, client_ip: str, limit_per_minute: int):
        now = time.time()
        window_start = now - 60.0
        
        # Filter older timestamps
        user_requests = [ts for ts in self.requests.get(client_ip, []) if ts > window_start]
        
        if len(user_requests) >= limit_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down and try again later."
            )
            
        user_requests.append(now)
        self.requests[client_ip] = user_requests

rate_limiter = SimpleRateLimiter()

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"

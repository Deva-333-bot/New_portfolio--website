import time
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

# In-memory cache for GitHub repositories
_github_cache: Dict[str, Any] = {
    "timestamp": 0,
    "data": []
}
CACHE_DURATION_SECONDS = 3600  # 1 hour

async def get_github_repositories(force_refresh: bool = False) -> List[Dict[str, Any]]:
    global _github_cache
    now = time.time()

    if not force_refresh and _github_cache["data"] and (now - _github_cache["timestamp"] < CACHE_DURATION_SECONDS):
        return _github_cache["data"]

    username = settings.GITHUB_USERNAME or "florantetech"
    url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=12"
    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "Portfolio-App/1.0"}

    if settings.GITHUB_TOKEN:
        headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                raw_repos = resp.json()
                formatted = [
                    {
                        "name": r.get("name"),
                        "full_name": r.get("full_name"),
                        "description": r.get("description"),
                        "html_url": r.get("html_url"),
                        "language": r.get("language") or "Python / TypeScript",
                        "stargazers_count": r.get("stargazers_count", 0),
                        "forks_count": r.get("forks_count", 0),
                        "updated_at": r.get("updated_at"),
                        "is_pinned": r.get("name") in ["techrica-learn-hub", "loan-prediction-ml", "fastapi-task-manager"]
                    }
                    for r in raw_repos
                ]
                _github_cache["data"] = formatted
                _github_cache["timestamp"] = now
                return formatted
    except Exception as e:
        print(f"GitHub API fetch note: {e}")

    # Fallback curated repositories if offline or unconfigured
    fallback = [
        {
            "name": "techrica-learn-hub",
            "full_name": f"{username}/techrica-learn-hub",
            "description": "Interactive learning management platform with role access and automated progress tracking.",
            "html_url": f"https://github.com/{username}/techrica-learn-hub",
            "language": "TypeScript",
            "stargazers_count": 5,
            "forks_count": 1,
            "updated_at": "2026-03-15T12:00:00Z",
            "is_pinned": True
        },
        {
            "name": "fastapi-task-manager",
            "full_name": f"{username}/fastapi-task-manager",
            "description": "Production task and workflow scheduling service built with FastAPI, PostgreSQL, and SQLAlchemy.",
            "html_url": f"https://github.com/{username}/fastapi-task-manager",
            "language": "Python",
            "stargazers_count": 3,
            "forks_count": 0,
            "updated_at": "2026-02-28T09:30:00Z",
            "is_pinned": True
        },
        {
            "name": "loan-prediction-ml",
            "full_name": f"{username}/loan-prediction-ml",
            "description": "Machine learning model exploratory evaluation pipeline for predictive credit risk assessment.",
            "html_url": f"https://github.com/{username}/loan-prediction-ml",
            "language": "Python",
            "stargazers_count": 4,
            "forks_count": 2,
            "updated_at": "2026-01-20T16:45:00Z",
            "is_pinned": True
        }
    ]
    _github_cache["data"] = fallback
    _github_cache["timestamp"] = now
    return fallback

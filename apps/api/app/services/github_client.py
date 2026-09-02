"""
Every call to GitHub's API goes through this one file. Keeping it
centralized means: one place to handle rate limits, one place to add
retry logic, and the rest of the app never talks to `httpx` directly.
"""
import httpx

GITHUB_API_BASE = "https://api.github.com"
GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"


class GitHubClient:
    def __init__(self, token: str | None = None):
        # `token` is the per-user OAuth token when acting on a user's
        # behalf, or the app-level indexer token for background jobs.
        headers = {"Accept": "application/vnd.github+json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        self._client = httpx.AsyncClient(headers=headers, timeout=15.0)

    async def get_authenticated_user(self) -> dict:
        """Who is this token's owner? Used right after OAuth login."""
        resp = await self._client.get(f"{GITHUB_API_BASE}/user")
        resp.raise_for_status()
        return resp.json()

    async def get_user_repos(self, username: str, per_page: int = 30) -> list[dict]:
        resp = await self._client.get(
            f"{GITHUB_API_BASE}/users/{username}/repos",
            params={"per_page": per_page, "sort": "updated"},
        )
        resp.raise_for_status()
        return resp.json()

    async def search_good_first_issues(
        self, language: str | None = None, label: str = "good first issue", page: int = 1
    ) -> dict:
        """
        Used by the background indexer job (see workers/tasks.py), NOT
        called live per-user - GitHub's Search API has a tight 30
        requests/minute limit, so this must run on a schedule and be
        cached, never triggered directly by a page load.
        """
        query_parts = [f'label:"{label}"', "state:open", "is:issue"]
        if language:
            query_parts.append(f"language:{language}")
        query = " ".join(query_parts)

        resp = await self._client.get(
            f"{GITHUB_API_BASE}/search/issues",
            params={"q": query, "per_page": 50, "page": page, "sort": "created", "order": "desc"},
        )
        resp.raise_for_status()
        return resp.json()

    async def get_repo(self, full_name: str) -> dict:
        """Fetch a single repo's details - used to get real star counts,
        topics, and language when the indexer encounters a repo it
        hasn't cached yet."""
        resp = await self._client.get(f"{GITHUB_API_BASE}/repos/{full_name}")
        resp.raise_for_status()
        return resp.json()

    async def has_contributing_guide(self, full_name: str) -> bool:
        """Checks for a CONTRIBUTING.md at the repo root. A 404 just
        means it doesn't exist - not a real error, so we swallow it."""
        resp = await self._client.get(f"{GITHUB_API_BASE}/repos/{full_name}/contents/CONTRIBUTING.md")
        return resp.status_code == 200

    async def get_user_profile(self, username: str) -> dict:
        """Fetch basic GitHub public profile details."""
        resp = await self._client.get(f"{GITHUB_API_BASE}/users/{username}")
        resp.raise_for_status()
        return resp.json()

    async def get_user_starred(self, username: str, per_page: int = 30) -> list[dict]:
        """Fetch repos starred by the user."""
        try:
            resp = await self._client.get(
                f"{GITHUB_API_BASE}/users/{username}/starred",
                params={"per_page": per_page, "sort": "created", "direction": "desc"},
            )
            if resp.status_code == 200:
                return resp.json()
            return []
        except Exception:
            return []

    async def analyze_user(self, username: str) -> dict:
        """
        Analyze a GitHub user's public repositories and starred repos to determine
        their primary languages and topics of interest.
        """
        profile = await self.get_user_profile(username)
        
        # Fetch user's own repositories
        try:
            repos = await self.get_user_repos(username, per_page=50)
        except Exception:
            repos = []

        # Fetch user's starred repositories
        starred = await self.get_user_starred(username, per_page=30)

        # Count languages weighted by repository recency / star presence
        language_weights: dict[str, float] = {}
        for r in repos:
            if r.get("fork"):
                weight = 0.5
            else:
                weight = 1.0 + min(r.get("stargazers_count", 0) * 0.1, 2.0)
            
            lang = r.get("language")
            if lang:
                language_weights[lang] = language_weights.get(lang, 0.0) + weight

        for r in starred:
            lang = r.get("language")
            if lang:
                language_weights[lang] = language_weights.get(lang, 0.0) + 0.6

        sorted_languages = [
            lang for lang, _ in sorted(language_weights.items(), key=lambda x: x[1], reverse=True)
        ]

        # Extract topics from user repos and starred repos
        topic_counts: dict[str, int] = {}
        for r in repos + starred:
            for topic in r.get("topics", []):
                topic_counts[topic] = topic_counts.get(topic, 0) + 1

        sorted_topics = [
            topic for topic, _ in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
        ]

        return {
            "username": profile.get("login", username),
            "name": profile.get("name") or profile.get("login", username),
            "avatar_url": profile.get("avatar_url"),
            "bio": profile.get("bio") or "",
            "public_repos": profile.get("public_repos", 0),
            "followers": profile.get("followers", 0),
            "top_languages": sorted_languages[:8],
            "top_topics": sorted_topics[:12],
        }

    POPULAR_USERS: list[dict] = [
        {
            "username": "tiangolo",
            "name": "Sebastián Ramírez",
            "avatar_url": "https://avatars.githubusercontent.com/u/1326112?v=4",
            "bio": "Creator of FastAPI, Typer, SQLModel, Asyncer",
            "public_repos": 140,
        },
        {
            "username": "shadcn",
            "name": "shadcn",
            "avatar_url": "https://avatars.githubusercontent.com/u/124599?v=4",
            "bio": "Creator of shadcn/ui and taxonomy",
            "public_repos": 90,
        },
        {
            "username": "sindresorhus",
            "name": "Sindre Sorhus",
            "avatar_url": "https://avatars.githubusercontent.com/u/170270?v=4",
            "bio": "Full-time open-sourcerer. Creator of pure-esm, chalk, xo",
            "public_repos": 1050,
        },
        {
            "username": "antfu",
            "name": "Anthony Fu",
            "avatar_url": "https://avatars.githubusercontent.com/u/11247099?v=4",
            "bio": "A fanatic open-sourceror. Vue / Vite / Nuxt core team",
            "public_repos": 400,
        },
        {
            "username": "gaearon",
            "name": "dan",
            "avatar_url": "https://avatars.githubusercontent.com/u/810438?v=4",
            "bio": "Working on React. Co-author of Redux",
            "public_repos": 270,
        },
        {
            "username": "torvalds",
            "name": "Linus Torvalds",
            "avatar_url": "https://avatars.githubusercontent.com/u/1024025?v=4",
            "bio": "Creator of Linux and Git",
            "public_repos": 10,
        },
        {
            "username": "Rich-Harris",
            "name": "Rich Harris",
            "avatar_url": "https://avatars.githubusercontent.com/u/1162160?v=4",
            "bio": "Creator of Svelte and Rollup",
            "public_repos": 220,
        },
        {
            "username": "yyx990803",
            "name": "Evan You",
            "avatar_url": "https://avatars.githubusercontent.com/u/499550?v=4",
            "bio": "Creator of Vue.js and Vite",
            "public_repos": 180,
        },
        {
            "username": "leerob",
            "name": "Lee Robinson",
            "avatar_url": "https://avatars.githubusercontent.com/u/9113740?v=4",
            "bio": "VP of Product at Vercel. Next.js contributor",
            "public_repos": 110,
        },
        {
            "username": "mitchellh",
            "name": "Mitchell Hashimoto",
            "avatar_url": "https://avatars.githubusercontent.com/u/1299?v=4",
            "bio": "Founder of HashiCorp. Creator of Vagrant, Packer, Terraform, Ghostty",
            "public_repos": 350,
        },
        {
            "username": "tj",
            "name": "TJ Holowaychuk",
            "avatar_url": "https://avatars.githubusercontent.com/u/25254?v=4",
            "bio": "Creator of Express, Koa, Apex, Commander.js",
            "public_repos": 580,
        },
    ]

    async def get_suggested_users(self) -> list[dict]:
        """Return popular/featured open-source developers for quick starter suggestions."""
        return self.POPULAR_USERS

    async def search_users(self, query: str, per_page: int = 6) -> list[dict]:
        """Search GitHub users for autocomplete dropdown with robust fallback support."""
        q_clean = (query or "").strip().lower()
        if not q_clean:
            return self.POPULAR_USERS[:per_page]

        # Filter our popular/curated list first for matching entries
        curated_matches = [
            u for u in self.POPULAR_USERS
            if q_clean in u["username"].lower() or (u.get("name") and q_clean in u["name"].lower())
        ]

        try:
            resp = await self._client.get(
                f"{GITHUB_API_BASE}/search/users",
                params={"q": f"{q_clean} in:login", "per_page": per_page},
            )
            if resp.status_code == 200:
                items = resp.json().get("items", [])
                api_users = [
                    {
                        "username": item.get("login"),
                        "name": None,
                        "avatar_url": item.get("avatar_url"),
                        "bio": None,
                        "public_repos": None,
                    }
                    for item in items
                ]
                # Merge curated matches to preserve richer metadata and deduplicate
                seen = set()
                combined = []
                for u in curated_matches + api_users:
                    norm = u["username"].lower()
                    if norm not in seen:
                        seen.add(norm)
                        combined.append(u)
                return combined[:per_page]
        except Exception:
            pass

        # If API is rate-limited or unavailable, return curated matches or fallback
        if curated_matches:
            return curated_matches[:per_page]
        return []

    async def close(self):
        await self._client.aclose()

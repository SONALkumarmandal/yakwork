import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.github_client import GitHubClient


@pytest.mark.asyncio
async def test_get_suggested_github_users():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/github/suggested-users")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    usernames = [u["username"] for u in data]
    assert "tiangolo" in usernames
    assert "shadcn" in usernames


@pytest.mark.asyncio
async def test_search_github_users_fallback():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/github/search-users?q=tian")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    usernames = [u["username"].lower() for u in data]
    assert any("tian" in u for u in usernames)


@pytest.mark.asyncio
async def test_github_client_curated_search():
    gh = GitHubClient()
    try:
        users = await gh.search_users("shad", per_page=5)
        assert len(users) > 0
        assert any(u["username"] == "shadcn" for u in users)
    finally:
        await gh.close()

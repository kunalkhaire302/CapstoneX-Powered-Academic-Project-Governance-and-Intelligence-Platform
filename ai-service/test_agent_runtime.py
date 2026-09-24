from fastapi.testclient import TestClient

from app.agent_main import app


def test_health_is_public():
    response = TestClient(app).get("/api/ai/health")
    assert response.status_code == 200
    assert response.json()["service"] == "capstonex-agent-runtime"


def test_execute_requires_internal_token():
    response = TestClient(app).post("/api/ai/agent-team/execute", json={})
    assert response.status_code in (403, 500)

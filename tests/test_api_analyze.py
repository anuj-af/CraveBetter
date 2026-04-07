from src.backend.api.app import app


def test_health_endpoint() -> None:
    client = app.test_client()
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["status"] == "ok"


def test_analyze_returns_expected_contract() -> None:
    client = app.test_client()
    response = client.post(
        "/api/analyze",
        json={"food": "cheeseburger and fries", "goal": "Fat loss", "time": "Dinner"},
    )
    assert response.status_code == 200
    payload = response.get_json()

    expected_keys = {
        "score",
        "issues",
        "improvement",
        "alternative",
        "explanation",
        "feeling",
        "tag",
        "source",
    }
    assert expected_keys.issubset(payload.keys())
    assert 1 <= payload["score"] <= 10
    assert payload["tag"] in {"healthy", "unhealthy"}
    assert isinstance(payload["issues"], list)


def test_analyze_validation_error_when_missing_food() -> None:
    client = app.test_client()
    response = client.post("/api/analyze", json={"goal": "General", "time": "Lunch"})
    assert response.status_code == 400
    payload = response.get_json()
    assert payload["error"] == "validation_failed"
    assert "food" in payload["details"]

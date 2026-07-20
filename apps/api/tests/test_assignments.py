from fastapi.testclient import TestClient


def create_course(client: TestClient) -> int:
    response = client.post(
        "/api/courses",
        json={"code": "CENG 301", "name": "Algorithms"},
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_assignment_lifecycle(client: TestClient) -> None:
    course_id = create_course(client)
    create_response = client.post(
        "/api/assignments",
        json={
            "course_id": course_id,
            "title": "  Graph theory problem set  ",
            "due_date": "2026-07-22",
        },
    )
    assert create_response.status_code == 201
    assignment = create_response.json()
    assert assignment["title"] == "Graph theory problem set"
    assert assignment["course"]["code"] == "CENG 301"
    assert assignment["completed"] is False

    assert len(client.get("/api/assignments").json()) == 1
    update_response = client.patch(
        f"/api/assignments/{assignment['id']}",
        json={"completed": True},
    )
    assert update_response.status_code == 200
    assert update_response.json()["completed"] is True

    assert client.delete(f"/api/assignments/{assignment['id']}").status_code == 204
    assert client.get("/api/assignments").json() == []


def test_assignment_validates_course_and_title(client: TestClient) -> None:
    missing_course = client.post(
        "/api/assignments",
        json={"course_id": 999, "title": "Problem set", "due_date": "2026-07-22"},
    )
    assert missing_course.status_code == 404

    course_id = create_course(client)
    blank_title = client.post(
        "/api/assignments",
        json={"course_id": course_id, "title": "  ", "due_date": "2026-07-22"},
    )
    assert blank_title.status_code == 422


def test_deleting_course_removes_assignments(client: TestClient) -> None:
    course_id = create_course(client)
    client.post(
        "/api/assignments",
        json={"course_id": course_id, "title": "Problem set", "due_date": "2026-07-22"},
    )

    assert client.delete(f"/api/courses/{course_id}").status_code == 204
    assert client.get("/api/assignments").json() == []

from fastapi.testclient import TestClient


def course_id(client: TestClient) -> int:
    return client.post("/api/courses", json={"code": "MATH 204", "name": "Linear Algebra"}).json()[
        "id"
    ]


def test_exam_lifecycle(client: TestClient) -> None:
    cid = course_id(client)
    response = client.post(
        "/api/exams",
        json={
            "course_id": cid,
            "title": " Midterm ",
            "exam_date": "2026-07-25",
            "start_time": "10:00",
            "location": " A-112 ",
        },
    )
    assert response.status_code == 201
    exam = response.json()
    assert exam["title"] == "Midterm"
    assert exam["course"]["code"] == "MATH 204"
    assert len(client.get("/api/exams").json()) == 1
    updated = client.patch(f"/api/exams/{exam['id']}", json={"location": "B-204"})
    assert updated.status_code == 200
    assert updated.json()["location"] == "B-204"
    assert client.delete(f"/api/exams/{exam['id']}").status_code == 204
    assert client.get("/api/exams").json() == []


def test_exam_validation_and_course_cascade(client: TestClient) -> None:
    assert (
        client.post(
            "/api/exams", json={"course_id": 999, "title": "Final", "exam_date": "2026-08-01"}
        ).status_code
        == 404
    )
    cid = course_id(client)
    assert (
        client.post(
            "/api/exams", json={"course_id": cid, "title": " ", "exam_date": "2026-08-01"}
        ).status_code
        == 422
    )
    client.post("/api/exams", json={"course_id": cid, "title": "Final", "exam_date": "2026-08-01"})
    assert client.delete(f"/api/courses/{cid}").status_code == 204
    assert client.get("/api/exams").json() == []

from fastapi.testclient import TestClient


def create_course(client: TestClient, code: str = "CENG 301") -> int:
    response = client.post(
        "/api/courses",
        json={"code": code, "name": f"{code} course", "color": "#6853d7"},
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_schedule_entry_lifecycle(client: TestClient) -> None:
    course_id = create_course(client)
    create_response = client.post(
        "/api/schedule",
        json={
            "course_id": course_id,
            "weekday": 0,
            "start_time": "09:00",
            "end_time": "10:30",
            "room": " B-204 ",
        },
    )

    assert create_response.status_code == 201
    entry = create_response.json()
    assert entry["room"] == "B-204"
    assert entry["course"]["code"] == "CENG 301"

    list_response = client.get("/api/schedule")
    assert list_response.status_code == 200
    assert [item["id"] for item in list_response.json()] == [entry["id"]]

    update_response = client.patch(
        f"/api/schedule/{entry['id']}",
        json={"start_time": "10:00", "end_time": "11:00", "room": "Lab 3"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["start_time"] == "10:00:00"
    assert update_response.json()["room"] == "Lab 3"

    assert client.delete(f"/api/schedule/{entry['id']}").status_code == 204
    assert client.get("/api/schedule").json() == []


def test_overlapping_schedule_entries_are_rejected(client: TestClient) -> None:
    first_course_id = create_course(client, "CENG 301")
    second_course_id = create_course(client, "MATH 204")
    first_entry = {
        "course_id": first_course_id,
        "weekday": 2,
        "start_time": "09:00",
        "end_time": "10:00",
    }
    assert client.post("/api/schedule", json=first_entry).status_code == 201

    overlapping = client.post(
        "/api/schedule",
        json={
            "course_id": second_course_id,
            "weekday": 2,
            "start_time": "09:30",
            "end_time": "11:00",
        },
    )
    assert overlapping.status_code == 409

    adjacent = client.post(
        "/api/schedule",
        json={
            "course_id": second_course_id,
            "weekday": 2,
            "start_time": "10:00",
            "end_time": "11:00",
        },
    )
    assert adjacent.status_code == 201

    another_day = client.post(
        "/api/schedule",
        json={**first_entry, "course_id": second_course_id, "weekday": 3},
    )
    assert another_day.status_code == 201


def test_schedule_validates_course_and_time_range(client: TestClient) -> None:
    missing_course = client.post(
        "/api/schedule",
        json={
            "course_id": 999,
            "weekday": 0,
            "start_time": "09:00",
            "end_time": "10:00",
        },
    )
    assert missing_course.status_code == 404

    course_id = create_course(client)
    invalid_time = client.post(
        "/api/schedule",
        json={
            "course_id": course_id,
            "weekday": 0,
            "start_time": "11:00",
            "end_time": "10:00",
        },
    )
    assert invalid_time.status_code == 422


def test_deleting_a_course_removes_its_schedule_entries(client: TestClient) -> None:
    course_id = create_course(client)
    client.post(
        "/api/schedule",
        json={
            "course_id": course_id,
            "weekday": 4,
            "start_time": "13:00",
            "end_time": "14:00",
        },
    )

    assert client.delete(f"/api/courses/{course_id}").status_code == 204
    assert client.get("/api/schedule").json() == []

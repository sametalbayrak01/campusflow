from fastapi.testclient import TestClient


def test_course_lifecycle(client: TestClient) -> None:
    create_response = client.post(
        "/api/courses",
        json={
            "code": "ceng 301",
            "name": "Algorithms",
            "instructor": "Ada Lovelace",
            "room": "B-204",
            "credits": 4,
        },
    )
    assert create_response.status_code == 201
    course = create_response.json()
    assert course["code"] == "CENG 301"
    assert course["name"] == "Algorithms"

    list_response = client.get("/api/courses")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    update_response = client.patch(
        f"/api/courses/{course['id']}",
        json={"room": "Lab 3", "color": "#397eb5"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["room"] == "Lab 3"

    get_response = client.get(f"/api/courses/{course['id']}")
    assert get_response.status_code == 200

    delete_response = client.delete(f"/api/courses/{course['id']}")
    assert delete_response.status_code == 204
    assert client.get(f"/api/courses/{course['id']}").status_code == 404


def test_duplicate_course_code_is_rejected(client: TestClient) -> None:
    payload = {"code": "CENG 315", "name": "Databases"}

    assert client.post("/api/courses", json=payload).status_code == 201
    duplicate_response = client.post("/api/courses", json=payload)

    assert duplicate_response.status_code == 409
    assert duplicate_response.json()["detail"] == "A course with this code already exists"

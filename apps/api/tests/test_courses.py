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


def test_course_text_is_normalized_and_blank_values_are_rejected(client: TestClient) -> None:
    response = client.post(
        "/api/courses",
        json={
            "code": "  ceng 101  ",
            "name": "  Introduction to Computing  ",
            "instructor": "   ",
            "room": "  A-101  ",
        },
    )

    assert response.status_code == 201
    assert response.json()["code"] == "CENG 101"
    assert response.json()["name"] == "Introduction to Computing"
    assert response.json()["instructor"] is None
    assert response.json()["room"] == "A-101"
    assert client.post("/api/courses", json={"code": "  ", "name": "Valid name"}).status_code == 422
    assert client.post("/api/courses", json={"code": "CS 1", "name": "  "}).status_code == 422


def test_patch_requires_a_change_and_rejects_null_required_fields(client: TestClient) -> None:
    course_id = client.post(
        "/api/courses",
        json={"code": "CENG 202", "name": "Data Structures"},
    ).json()["id"]

    assert client.patch(f"/api/courses/{course_id}", json={}).status_code == 422
    for field in ("code", "name", "color", "credits"):
        response = client.patch(f"/api/courses/{course_id}", json={field: None})
        assert response.status_code == 422


def test_patch_can_clear_optional_fields(client: TestClient) -> None:
    course_id = client.post(
        "/api/courses",
        json={
            "code": "MATH 204",
            "name": "Linear Algebra",
            "instructor": "Emmy Noether",
            "room": "A-112",
        },
    ).json()["id"]

    response = client.patch(
        f"/api/courses/{course_id}",
        json={"instructor": "", "room": None},
    )

    assert response.status_code == 200
    assert response.json()["instructor"] is None
    assert response.json()["room"] is None


def test_update_duplicate_code_and_missing_course_errors(client: TestClient) -> None:
    first_id = client.post(
        "/api/courses",
        json={"code": "CENG 301", "name": "Algorithms"},
    ).json()["id"]
    client.post("/api/courses", json={"code": "CENG 315", "name": "Databases"})

    duplicate_response = client.patch(
        f"/api/courses/{first_id}",
        json={"code": "ceng 315"},
    )

    assert duplicate_response.status_code == 409
    assert client.patch("/api/courses/999", json={"room": "B-1"}).status_code == 404
    assert client.delete("/api/courses/999").status_code == 404

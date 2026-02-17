def test_register(client):
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "secret123",
        "full_name": "Test User",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data


def test_register_duplicate_email(client):
    payload = {"email": "dup@example.com", "password": "secret", "full_name": "Dup"}
    client.post("/auth/register", json=payload)
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 400


def test_login(client):
    client.post("/auth/register", json={
        "email": "login@example.com",
        "password": "secret123",
        "full_name": "Login User",
    })
    response = client.post("/auth/login", data={
        "username": "login@example.com",
        "password": "secret123",
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_me(client):
    client.post("/auth/register", json={
        "email": "me@example.com",
        "password": "secret123",
        "full_name": "Me User",
    })
    login = client.post("/auth/login", data={
        "username": "me@example.com",
        "password": "secret123",
    })
    token = login.json()["access_token"]
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"

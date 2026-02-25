def test_register(client):
    resp = client.post("/auth/register", json={"email": "a@b.com", "password": "test123"})
    assert resp.status_code == 201
    assert resp.json()["email"] == "a@b.com"

def test_register_duplicate(client):
    client.post("/auth/register", json={"email": "a@b.com", "password": "test123"})
    resp = client.post("/auth/register", json={"email": "a@b.com", "password": "test123"})
    assert resp.status_code == 400

def test_login(client):
    client.post("/auth/register", json={"email": "a@b.com", "password": "test123"})
    resp = client.post("/auth/login", data={"username": "a@b.com", "password": "test123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()

def test_protected_route_no_token(client):
    resp = client.get("/categories/")
    assert resp.status_code == 401

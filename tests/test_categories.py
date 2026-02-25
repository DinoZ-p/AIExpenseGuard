def test_create_category(auth_client):
    resp = auth_client.post("/categories/", json={
        "name": "Groceries", "type": "expense", "is_essential": True
    })
    assert resp.status_code == 201
    assert resp.json()["name"] == "Groceries"

def test_list_categories(auth_client):
    auth_client.post("/categories/", json={"name": "Food", "type": "expense"})
    resp = auth_client.get("/categories/")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) == 1

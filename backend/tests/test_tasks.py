import pytest


class TestTasks:

    @pytest.fixture(autouse=True)
    def _setup(self, client):
        self.client = client

    def test_read_tasks(self):
        response = self.client.get("/tasks")
        assert response.status_code == 200

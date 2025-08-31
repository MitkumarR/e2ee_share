import pytest
from src import create_app

@pytest.fixture(scope='module')
def test_app():
    """
    Creates a Flask app instance configured for testing.
    This is created once for all tests in this module.
    """
    app = create_app(config_name='testing')
    with app.app_context():
        yield app

@pytest.fixture(scope='function')
def test_client(test_app):
    """
    Creates a test client for our Flask app.
    A new client is created for each test function to ensure isolation.
    """
    return test_app.test_client()

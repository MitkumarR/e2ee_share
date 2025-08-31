import pytest
from src import create_app

@pytest.fixture(scope='module')
def test_app():
    """
    Creates a Flask app instance configured for testing.
    'module' scope means this fixture is created once for all tests in a file.
    """
    # Force the app to be created with the 'testing' configuration
    app = create_app(config_name='testing')
    
    # Establish an application context before running the tests
    with app.app_context():
        yield app

@pytest.fixture(scope='function')
def test_client(test_app):
    """
    Creates a test client for the Flask app.
    'function' scope means a new client is created for each test function,
    ensuring tests are isolated from each other.
    """
    return test_app.test_client()


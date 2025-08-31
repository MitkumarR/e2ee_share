import pytest
from src import create_app

@pytest.fixture(scope='module')
def test_app():
    """
    Creates a Flask app instance configured for testing.
    This fixture is created once for all tests in this module.
    """
    # Create the app with the 'testing' configuration
    app = create_app(config_name='testing')
    
    # Establish an application context to make 'app' and 'g' available
    with app.app_context():
        # Here we could also initialize a test database if needed,
        # but for these unit tests, we will mock the DB calls directly.
        yield app

@pytest.fixture(scope='function')
def test_client(test_app):
    """
    Creates a test client for our Flask app.
    A new client is created for each test function to ensure isolation.
    """
    return test_app.test_client()

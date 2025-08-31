import json
from unittest.mock import MagicMock

# --- Registration Flow Tests ---

def test_send_otp_for_new_user(test_client, mocker):
    """
    GIVEN a new user's email address
    WHEN the '/auth/send-otp' endpoint is hit
    THEN it should succeed WITHOUT trying to connect to a real Redis server.
    """
    # === THE FIX IS HERE ===
    # We find where redis_client is imported in your routes and replace it.
    mock_redis = mocker.patch('src.routes.redis_client')
    # =======================

    # We also mock the other dependencies for this test
    mocker.patch('src.models.User.query').filter_by.return_value.first.return_value = None
    mocker.patch('src.routes.send_otp_email')

    email = "test@example.com"
    response = test_client.post('/auth/send-otp', json={'email': email})

    # Now, the test passes because the real redis_client.set is never called.
    assert response.status_code == 200
    assert response.json['msg'] == f"OTP sent to {email}."
    
    # We can even check if our MOCK was used correctly.
    mock_redis.set.assert_called_once()


def test_verify_otp_correct(test_client, mocker):
    """
    GIVEN a correct email and OTP
    WHEN the '/auth/verify-otp' endpoint is hit
    THEN it should return a 200 OK and use the mocked Redis client.
    """
    # Mock redis_client for this test
    mock_redis = mocker.patch('src.routes.redis_client')
    # Configure the mock to return the correct OTP when 'get' is called
    mock_redis.get.return_value = b'123456'  # Redis returns bytes

    response = test_client.post('/auth/verify-otp', json={'email': 'test@example.com', 'otp': '123456'})

    assert response.status_code == 200
    assert response.json['msg'] == "Email verified successfully. You can now set your password."
    # Check that it tried to use our mock to set the verified status and delete the old OTP
    mock_redis.set.assert_called_once_with('verified-email:test@example.com', 'true', ex=600)
    mock_redis.delete.assert_called_once_with('otp:test@example.com')


def test_set_password_successful(test_client, mocker):
    """
    GIVEN a user has a verified status in our mocked Redis
    WHEN the '/auth/set-password' endpoint is hit
    THEN it should create the user and mock a database commit.
    """
    # Mock redis_client for this test
    mock_redis = mocker.patch('src.routes.redis_client')
    mock_redis.get.return_value = b'true' # Email is verified in our mock
    
    # Mock the other dependencies
    mock_db_session = mocker.patch('src.db.session')
    mocker.patch('src.routes.User')

    response = test_client.post('/auth/set-password', json={'email': 'test@example.com', 'password': 'strongpassword'})

    assert response.status_code == 201
    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
    mock_redis.delete.assert_called_once_with('verified-email:test@example.com')


# --- Login Flow Test (No Redis involved, so no Redis mock needed) ---

def test_login_successful(test_client, mocker):
    """
    GIVEN a correct email and password for a verified user
    WHEN the '/auth/login' endpoint is hit
    THEN it should return a 200 OK with JWT tokens.
    """
    mock_user = MagicMock()
    mock_user.check_password.return_value = True
    mock_user.is_verified = True
    mock_user.id = 1
    # Here we only need to mock the database query
    mocker.patch('src.models.User.query').filter_by.return_value.first.return_value = mock_user

    response = test_client.post('/auth/login', json={'email': 'user@example.com', 'password': 'password123'})

    assert response.status_code == 200
    assert 'access_token' in response.json


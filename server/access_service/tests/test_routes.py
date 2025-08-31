import json
from unittest.mock import MagicMock
from flask_jwt_extended import create_access_token

def test_create_share_link_success(test_client, mocker):
    """
    GIVEN an authenticated user and valid data
    WHEN the '/access/link/create' endpoint is called
    THEN it should return a 201 status and a new share_id.
    """
    # 1. Mock the redis_client used in the routes
    mock_redis = mocker.patch('src.routes.redis_client')
    
    # 2. Setup authentication
    user_id = 1
    access_token = create_access_token(identity=str(user_id))
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    # 3. Prepare request data
    post_data = {
        'file_id': 'file-123-abc',
        'wrapped_key': 'a-very-long-encrypted-key-string'
    }

    # 4. Make the request
    response = test_client.post('/access/link/create', headers=headers, data=json.dumps(post_data))

    # 5. Assert the outcome
    assert response.status_code == 201
    assert 'share_id' in response.json
    
    # 6. Assert that our mocks were called correctly
    mock_redis.hset.assert_called_once()
    mock_redis.expire.assert_called_once()


def test_get_link_details_success(test_client, mocker):
    """
    GIVEN a valid and unused share_id
    WHEN the '/access/link/details/<share_id>' endpoint is called
    THEN it should return the file details and invalidate the link.
    """
    # 1. Mock the redis_client and its pipeline
    mock_pipeline = MagicMock()
    
    # Simulate the return values from the transactional pipeline
    mock_pipeline.hget.return_value = b'true' # is_valid check
    mock_pipeline.execute.return_value = [ # This is the 'results' list
        { # This is the share_data dictionary from hgetall
            b'file_id': b'file-123-abc',
            b'wrapped_key': b'a-very-long-encrypted-key-string'
        }
    ]
    
    mock_redis = mocker.patch('src.routes.redis_client')
    mock_redis.pipeline.return_value.__enter__.return_value = mock_pipeline

    # 2. Make the request
    response = test_client.get('/access/link/details/some-valid-share-id')

    # 3. Assert the outcome
    assert response.status_code == 200
    assert response.json['file_id'] == 'file-123-abc'
    assert response.json['wrapped_key'] == 'a-very-long-encrypted-key-string'
    
    # 4. Assert that the transaction was handled correctly
    mock_pipeline.watch.assert_called_once()
    mock_pipeline.multi.assert_called_once()
    mock_pipeline.hgetall.assert_called_once()
    mock_pipeline.hset.assert_called_once_with(f"share:some-valid-share-id", "valid", "false")
    mock_pipeline.execute.assert_called_once()


def test_get_link_details_invalid_or_used(test_client, mocker):
    """
    GIVEN an invalid or already used share_id
    WHEN the '/access/link/details/<share_id>' endpoint is called
    THEN it should return a 404 Not Found error.
    """
    # 1. Mock the redis_client and its pipeline
    mock_pipeline = MagicMock()
    
    # Simulate the is_valid check returning false
    mock_pipeline.hget.return_value = b'false' 
    
    mock_redis = mocker.patch('src.routes.redis_client')
    mock_redis.pipeline.return_value.__enter__.return_value = mock_pipeline
    
    # 2. Make the request
    response = test_client.get('/access/link/details/some-invalid-share-id')

    # 3. Assert the outcome
    assert response.status_code == 404
    assert response.json['msg'] == "Link is invalid, expired, or has already been used"

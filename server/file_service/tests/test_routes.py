import io
from unittest.mock import MagicMock, patch
from flask_jwt_extended import create_access_token

def test_upload_file_success(test_client, mocker):
    """
    GIVEN an authenticated user and a file to upload
    WHEN the '/files/upload' endpoint is hit with multipart/form-data
    THEN it should return 201 Created and confirm database and file save calls were mocked.
    """
    # 1. Mock external dependencies
    mock_db_session = mocker.patch('src.db.session')
    mock_file_save = mocker.patch('werkzeug.datastructures.FileStorage.save')


    mock_file_instance = MagicMock()
    mock_file_instance.to_dict.return_value = {
        "id": "mock_uuid",
        "filename": "test.txt",
        # ... other fields as needed for the response
    }
    # When `File(...)` is called in the route, it will return our mock_file_instance
    mocker.patch('src.routes.File', return_value=mock_file_instance)

    # 2. Create a dummy access token and headers
    user_id = 1
    access_token = create_access_token(identity=str(user_id))
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    # 3. Prepare mock data
    file_data = {
        'file': (io.BytesIO(b"my file contents"), 'test.txt'),
        'filename': 'test.txt',
        'contentType': 'text/plain',
        'size': '17'
    }

    # 4. Make the request
    response = test_client.post('/files/upload',
                                headers=headers,
                                content_type='multipart/form-data',
                                data=file_data)

    # 5. Assert the outcome
    assert response.status_code == 201
    assert response.json['msg'] == "File uploaded successfully"
    assert response.json['file']['filename'] == 'test.txt'
    
    # 6. Assert that our mocks were called correctly
    mock_file_save.assert_called_once()
    # Check that the session tried to add the instance we created
    mock_db_session.add.assert_called_once_with(mock_file_instance)
    mock_db_session.commit.assert_called_once()


def test_get_my_files(test_client, mocker):
    """
    GIVEN an authenticated user
    WHEN the '/files/my-files' endpoint is hit
    THEN it should return a list of that user's files.
    """
    # 1. Create dummy access token and headers
    user_id = 1
    access_token = create_access_token(identity=str(user_id))
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    # 2. Mock database query
    mock_file = MagicMock()
    mock_file.to_dict.return_value = {"id": "file123", "filename": "mydoc.pdf"}
    mocker.patch('src.models.File.query').filter_by.return_value.order_by.return_value.all.return_value = [mock_file]

    # 3. Make the request with headers
    response = test_client.get('/files/my-files', headers=headers)

    # 4. Assert the outcome
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) == 1
    assert response.json[0]['filename'] == "mydoc.pdf"


def test_delete_file_permanently(test_client, mocker):
    """
    GIVEN an authenticated user and a file ID for a 'trashed' file
    WHEN the '/files/file/<file_id>' endpoint is hit with DELETE
    THEN it should permanently delete the file and its record.
    """
    # 1. Create dummy access token and headers
    user_id = 1
    access_token = create_access_token(identity=str(user_id))
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    # 2. Mock dependencies
    mock_db_session = mocker.patch('src.db.session')
    mock_os_path_exists = mocker.patch('os.path.exists', return_value=True)
    mock_os_remove = mocker.patch('os.remove')
    
    mock_file_to_delete = MagicMock()
    mock_file_to_delete.status = 'trashed'
    mock_file_to_delete.storage_path = '/fake/path/to/file.enc'
    
    mocker.patch('src.models.File.query').filter_by.return_value.first.return_value = mock_file_to_delete

    # 3. Make the request with headers
    response = test_client.delete('/files/file/file123', headers=headers)

    # 4. Assert the outcome
    assert response.status_code == 200
    assert response.json['msg'] == "File permanently deleted"

    # 5. Assert mocks were called
    mock_os_path_exists.assert_called_once_with('/fake/path/to/file.enc')
    mock_os_remove.assert_called_once_with('/fake/path/to/file.enc')
    mock_db_session.delete.assert_called_once_with(mock_file_to_delete)
    mock_db_session.commit.assert_called_once()


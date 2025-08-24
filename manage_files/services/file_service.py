import os
import uuid
from werkzeug.utils import secure_filename
from models.file import File
from extensions import db

# Define the upload folder at the top
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def save_file(user_id, file_data, encrypted_aes_key, original_filename, mime_type, size):
    """Saves the encrypted file to disk and its metadata to the database."""

    # Generate a secure, unique filename for storage to prevent conflicts
    # The extension doesn't matter since the file is encrypted binary data
    storage_filename = f"{uuid.uuid4()}.bin"
    file_path = os.path.join(UPLOAD_FOLDER, storage_filename)

    # Save the encrypted file blob to the filesystem
    file_data.save(file_path)

    # Create the metadata record for the database
    new_file = File(
        filename=original_filename,
        file_path=file_path,
        encrypted_aes_key=encrypted_aes_key,
        mime_type=mime_type,
        size=size,
        user_id=user_id
    )

    db.session.add(new_file)
    db.session.commit()

    return new_file
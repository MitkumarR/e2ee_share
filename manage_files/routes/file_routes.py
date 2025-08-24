from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services import file_service

file_bp = Blueprint('file_bp', __name__)

@file_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    # Get the user ID from the JWT token
    user_id = get_jwt_identity()

    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400

    file = request.files['file']
    encrypted_aes_key = request.form.get('encrypted_aes_key')
    original_filename = request.form.get('filename', file.filename)
    mime_type = request.form.get('mime_type', file.mimetype)
    size = request.form.get('size')


    if not all([file, encrypted_aes_key, original_filename, mime_type, size]):
        return jsonify({'message': 'Missing file, key, or metadata'}), 400

    try:
        new_file_meta = file_service.save_file(
            user_id=user_id,
            file_data=file,
            encrypted_aes_key=encrypted_aes_key,
            original_filename=original_filename,
            mime_type=mime_type,
            size=int(size)
        )
        return jsonify({
            'message': 'File uploaded successfully',
            'file_id': new_file_meta.id
        }), 201
    except Exception as e:
        # In production, you'd want more robust logging here
        print(e)
        return jsonify({'message': 'An error occurred during file upload'}), 500
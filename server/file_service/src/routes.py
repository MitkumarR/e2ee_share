from flask import request, jsonify, Blueprint, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from src import db
from src.models import File
import uuid
import os

file_bp = Blueprint('files', __name__, url_prefix='/files')

# Configure a simple upload folder
UPLOAD_FOLDER = os.path.abspath('uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@file_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    current_user_id = int(get_jwt_identity())

    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400
    
    encrypted_file = request.files['file']
    original_filename = request.form.get('filename')
    content_type = request.form.get('contentType')
    file_size = request.form.get('size')

    if not all([original_filename, content_type, file_size]):
        return jsonify({"msg": "Missing metadata"}), 400

    # Generate a unique path to store the encrypted file
    storage_filename = f"{uuid.uuid4()}.enc"
    storage_path = os.path.join(UPLOAD_FOLDER, storage_filename)
    
    # Save the encrypted file blob to the filesystem
    encrypted_file.save(storage_path)

    # Create the metadata record for the database
    new_file = File(
        owner_user_id=current_user_id,
        filename=original_filename,
        content_type=content_type,
        size=int(file_size),
        storage_path=storage_path
    )

    db.session.add(new_file)
    db.session.commit()

    return jsonify({
        "msg": "File uploaded successfully", 
        "file": new_file.to_dict()
    }), 201
    
@file_bp.route('/my-files', methods=['GET'])
@jwt_required()
def get_my_files():
    """Fetches all files for the authenticated user."""
    current_user_id = int(get_jwt_identity())
    
    files = File.query.filter_by(owner_user_id=current_user_id).order_by(File.created_at.desc()).all()
    
    return jsonify([file.to_dict() for file in files]), 200

@file_bp.route('/file/<string:file_id>/status', methods=['PUT'])
@jwt_required()
def update_file_status(file_id):
    """Updates the status of a file (e.g., to 'trashed', 'archived', 'active')."""
    current_user_id = int(get_jwt_identity())
    
    file_to_update = File.query.filter_by(id=file_id, owner_user_id=current_user_id).first()
    
    if not file_to_update:
        return jsonify({"msg": "File not found or access denied"}), 404
        
    new_status = request.json.get('status')
    if new_status not in ['active', 'trashed', 'archived']:
        return jsonify({"msg": "Invalid status"}), 400
        
    file_to_update.status = new_status
    db.session.commit()
    
    return jsonify(file_to_update.to_dict()), 200

@file_bp.route('/file/<string:file_id>', methods=['DELETE'])
@jwt_required()
def delete_file_permanently(file_id):
    """Permanently deletes a file record and its stored blob."""
    current_user_id = int(get_jwt_identity())
    
    file_to_delete = File.query.filter_by(id=file_id, owner_user_id=current_user_id).first()

    if not file_to_delete:
        return jsonify({"msg": "File not found or access denied"}), 404
        
    # Optional but recommended: Only allow permanent deletion of trashed files
    if file_to_delete.status != 'trashed':
        return jsonify({"msg": "File must be in the trash to be deleted permanently"}), 403

    # Delete the physical file from storage
    try:
        if os.path.exists(file_to_delete.storage_path):
            os.remove(file_to_delete.storage_path)
    except Exception as e:
        # Log the error but proceed to delete the DB record
        print(f"Error deleting physical file {file_to_delete.storage_path}: {e}")

    # Delete the record from the database
    db.session.delete(file_to_delete)
    db.session.commit()

    return jsonify({"msg": "File permanently deleted"}), 200

@file_bp.route('/public-meta/<string:file_id>', methods=['GET'])
def get_public_meta(file_id):
    """
    Public endpoint to get basic, non-sensitive file metadata for the download page.
    """
    file_record = File.query.filter_by(id=file_id).first()
    if not file_record:
        return jsonify({"msg": "File not found"}), 404
    
    return jsonify({
        "filename": file_record.filename,
        "size": file_record.size
    }), 200

@file_bp.route('/download/<string:file_id>', methods=['GET'])
def download_file(file_id):
    """
    Public endpoint to download the raw, encrypted file blob.
    """
    file_record = File.query.filter_by(id=file_id).first()
    if not file_record:
        return jsonify({"msg": "File not found"}), 404
        
    # Extract the directory and the filename from the stored path
    directory = os.path.dirname(file_record.storage_path)
    filename = os.path.basename(file_record.storage_path)
    
    # Use Flask's send_from_directory to securely serve the file
    return send_from_directory(directory, filename, as_attachment=True)

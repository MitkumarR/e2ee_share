from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from src import redis_client
import uuid

access_bp = Blueprint('access', __name__, url_prefix='/access')

@access_bp.route('/link/create', methods=['POST'])
@jwt_required()
def create_share_link():
    """
    The file owner calls this to create a shareable link.
    The owner's client provides the file_id and the wrapped (encrypted) file key.
    """
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    file_id = data.get('file_id')
    wrapped_key = data.get('wrapped_key') # The AES key, encrypted with the link_secret

    if not all([file_id, wrapped_key]):
        return jsonify({"msg": "Missing file_id or wrapped_key"}), 400

    share_id = str(uuid.uuid4())
    
    # Store the mapping in Redis. It will expire in 24 hours.
    # We use a Redis Hash to store all related info together.
    redis_key = f"share:{share_id}"
    redis_client.hset(redis_key, mapping={
        "file_id": file_id,
        "owner_id": current_user_id,
        "wrapped_key": wrapped_key,
        "valid": "true" # Flag to check if the link has been used
    })
    redis_client.expire(redis_key, 86400) # 24-hour expiry

    return jsonify({"share_id": share_id}), 201


@access_bp.route('/link/details/<string:share_id>', methods=['GET'])
def get_link_details(share_id):
    """
    Public endpoint for a recipient to get the file_id and wrapped_key.
    This also invalidates the link, making it one-time use.
    """
    redis_key = f"share:{share_id}"
    
    with redis_client.pipeline() as pipe:
        try:
            pipe.watch(redis_key)
            
            # We check the 'valid' flag first.
            is_valid = pipe.hget(redis_key, "valid")
            if not is_valid or is_valid.decode('utf-8') != 'true':
                return jsonify({"msg": "Link is invalid, expired, or has already been used"}), 404

            # If it's valid, we get all the data and invalidate it in one transaction.
            pipe.multi()
            pipe.hgetall(redis_key) # Queue command to get all data
            pipe.hset(redis_key, "valid", "false") # Queue command to invalidate
            
            results = pipe.execute()
            share_data = results[0] # The result of hgetall is the first item in the results

            if not share_data: # Should not happen if watch/multi worked, but a good safeguard
                return jsonify({"msg": "Link data could not be retrieved"}), 404

            # Decode the data for the JSON response
            return jsonify({
                "file_id": share_data.get(b'file_id', b'').decode('utf-8'),
                "wrapped_key": share_data.get(b'wrapped_key', b'').decode('utf-8')
            }), 200

        except Exception as e:
            print(f"Error in Redis transaction: {e}") # Added logging
            return jsonify({"msg": "An error occurred. Please try again."}), 500
# /auth-service/routes/auth_routes.py

from flask import Blueprint, request, jsonify
from services import auth_service

# Create a Blueprint
auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint for user registration."""
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400

    response, status_code = auth_service.user_register(data)
    return jsonify(response), status_code

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint for user login."""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400

    response, status_code = auth_service.user_login(data)
    return jsonify(response), status_code

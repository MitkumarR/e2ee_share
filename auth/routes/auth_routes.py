# /auth-service/routes/auth_routes.py

from flask import Blueprint, request, jsonify
from services import auth_service

# Create a Blueprint
auth_bp = Blueprint('auth_bp', __name__)

from services.verification_service import VerificationService
from flask_jwt_extended import jwt_required

verification_service = VerificationService()  # Create an instance of the service

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp_route():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'message': 'Email is required'}), 400

    response, status_code = verification_service.send_otp(email)
    return jsonify(response), status_code

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp_route():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    if not email or not otp:
        return jsonify({'message': 'Missing email or OTP'}), 400

    response, status_code = verification_service.verify_otp(email, otp)
    return jsonify(response), status_code

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


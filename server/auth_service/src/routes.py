# auth_service/routes.py
# This file contains the API routes for the authentication service.

from flask import request, jsonify, Blueprint
from src import db
from src.models import User
from src.utils import send_otp_email, generate_otp
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta

# Create a Blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User with this email already exists"}), 409

    new_user = User(email=email)
    new_user.set_password(password)
    otp = generate_otp()
    new_user.otp = otp
    new_user.otp_expiration = datetime.utcnow() + timedelta(minutes=10)

    if not send_otp_email(email, otp):
        return jsonify({"msg": "Failed to send OTP email"}), 500

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User registered. Check email for OTP."}), 201

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp_provided = data.get('otp')

    if not email or not otp_provided:
        return jsonify({"msg": "Email and OTP are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"msg": "User not found"}), 404
    if user.is_verified:
        return jsonify({"msg": "Account already verified"}), 400
    if datetime.utcnow() > user.otp_expiration:
        return jsonify({"msg": "OTP has expired"}), 400
    if user.otp != otp_provided:
        return jsonify({"msg": "Invalid OTP"}), 400

    user.is_verified = True
    user.otp = None
    user.otp_expiration = None
    db.session.commit()

    return jsonify({"msg": "Account verified successfully."}), 200

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"msg": "Bad email or password"}), 401
    if not user.is_verified:
        return jsonify({"msg": "Account not verified"}), 403

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify(access_token=access_token, refresh_token=refresh_token), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify(access_token=new_access_token), 200

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify(logged_in_as=user.email), 200

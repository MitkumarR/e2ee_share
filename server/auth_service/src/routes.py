# auth_service/routes.py
# This file contains the API routes for the authentication service.

from flask import request, jsonify, Blueprint
from src import db
from src.models import User
from src.utils import send_otp_email, generate_otp
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from src import redis_client

# Create a Blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    # This route remains the same. It works perfectly.
    email = request.get_json().get('email')
    if not email:
        return jsonify({"msg": "Email is required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "An account with this email already exists"}), 409

    otp = generate_otp()
    otp_expiration_minutes = 5
    redis_client.set(f"otp:{email}", otp, ex=otp_expiration_minutes * 60)
    send_otp_email(email, otp, otp_expiration_minutes)
    return jsonify({"msg": f"OTP sent to {email}."}), 200


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """
    Step 2: Verifies OTP and sets a 'verified' status in Redis.
    IT DOES NOT RETURN A TOKEN ANYMORE.
    """
    email = request.get_json().get('email')
    otp_provided = request.get_json().get('otp')

    if not email or not otp_provided:
        return jsonify({"msg": "Email and OTP are required"}), 400

    stored_otp_bytes = redis_client.get(f"otp:{email}")
    if not stored_otp_bytes or stored_otp_bytes.decode('utf-8') != otp_provided:
        return jsonify({"msg": "Invalid or expired OTP"}), 400

    # <-- CHANGE: Instead of creating a token, set a verified status in Redis
    # This status will expire in 10 minutes.
    redis_client.set(f"verified-email:{email}", "true", ex=600)
    
    # Clean up the used OTP
    redis_client.delete(f"otp:{email}")

    return jsonify({"msg": "Email verified successfully. You can now set your password."}), 200


@auth_bp.route('/set-password', methods=['POST'])
def set_password():
    """
    Step 3: Checks for the 'verified' status in Redis, then creates the user.
    IT DOES NOT REQUIRE A TOKEN ANYMORE.
    """
    email = request.get_json().get('email')
    password = request.get_json().get('password')

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    # <-- CHANGE: Check Redis to ensure the email was actually verified
    is_verified_in_redis = redis_client.get(f"verified-email:{email}")
    if not is_verified_in_redis:
        return jsonify({"msg": "Email not verified or session expired. Please start over."}), 403

    # Now that we know the email is verified, create the user
    new_user = User(email=email)
    new_user.set_password(password)
    new_user.is_verified = True

    db.session.add(new_user)
    db.session.commit()
    
    # Clean up the verification status from Redis
    redis_client.delete(f"verified-email:{email}")

    return jsonify({"msg": "User account created successfully! Please log in."}), 201



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

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

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

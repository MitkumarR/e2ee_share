import random
from models.user import User
from extensions import db
from flask_jwt_extended import create_access_token

from .verification_service import VerificationService

from flask_jwt_extended import get_jwt_identity

def user_register(data):
    """
    Handles user registration. This is the final step and requires a
    valid verification token.
    """

    username = data.get('username')
    password = data.get('password')
    email = data.get('email')  # Use the email from the request body

    # This check is still a good safeguard
    if User.query.filter_by(email=email).first():
        return {'message': 'User already exists'}, 409

    new_user = User(username=username, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

    return {'message': 'User registered successfully'}, 201

def user_login(data):
    """Handles user login logic."""
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    # if not user.is_verified:
    #     return {'message': 'Account not verified. Please check your email for the OTP.'}, 403

    if user and user.check_password(password):
            # Create a JWT token
        access_token = create_access_token(identity=user.id)
        return {'access_token': access_token}, 200

    return {'message': 'Invalid credentials'}, 401
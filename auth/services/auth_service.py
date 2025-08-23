from auth.models.user import User
from auth.extensions import db
from flask_jwt_extended import create_access_token

def register_user(data):
    """Handles user registration logic."""
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
        return {'message': 'User already exists'}, 409

    new_user = User(username=username, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

    return {'message': 'User registered successfully'}, 201

def login_user(data):
    """Handles user login logic."""
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        # Create a JWT token
        access_token = create_access_token(identity=user.id)
        return {'access_token': access_token}, 200

    return {'message': 'Invalid credentials'}, 401
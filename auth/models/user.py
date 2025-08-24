# /auth-services/models/user.py
from enum import unique

from extensions import db, bcrypt
import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    is_verified = db.Column(db.Boolean, nullable=False, default=False)

    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')


    def check_password(self, password):
        """Check if the provided password matches the hashed password."""
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.email}>'
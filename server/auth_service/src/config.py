# src/auth_service/config.py
# This file contains the configuration settings for the Flask application.

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the absolute path of the directory containing the current file.
basedir = os.path.abspath(os.path.dirname(__file__))

# Helper function to build the PostgreSQL database URI
def get_postgres_uri():
    user = os.environ.get('POSTGRES_USER')
    password = os.environ.get('POSTGRES_PASSWORD')
    host = os.environ.get('POSTGRES_HOST', 'localhost')
    port = os.environ.get('POSTGRES_PORT', '5432')
    db_name = os.environ.get('POSTGRES_DB')
    
    if not all([user, password, db_name]):
        raise ValueError("Missing required database environment variables")
    
    return f"postgresql://{user}:{password}@{host}:{port}/{db_name}"

class Config:
    """
    Base configuration class. Contains default settings and settings
    common to all environments.
    """
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or os.environ.get('MAIL_USERNAME')

    @staticmethod
    def init_app(app):
        pass

class DevelopmentConfig(Config):
    """Configuration for development."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or get_postgres_uri()

class TestingConfig(Config):
    """Configuration for testing."""
    TESTING = True
    # For testing, you might want a separate test database
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or 'sqlite://' # Or a test postgres DB
    WTF_CSRF_ENABLED = False 

class ProductionConfig(Config):
    """Configuration for production."""
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or get_postgres_uri()
    # Add other production-specific settings here

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

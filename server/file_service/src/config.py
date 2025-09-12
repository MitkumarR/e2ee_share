import os
from dotenv import load_dotenv

load_dotenv()

def get_postgres_uri():
    user = os.environ.get('POSTGRES_USER')
    password = os.environ.get('POSTGRES_PASSWORD')
    host = os.environ.get('POSTGRES_HOST')
    port = os.environ.get('POSTGRES_PORT')
    db_name = os.environ.get('POSTGRES_DB')
        
    if not all([user, password, db_name]):
        raise ValueError("Missing required database environment variables")
    
    return f"postgresql://{user}:{password}@{host}:{port}/{db_name}"

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') # Must match the auth service
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = get_postgres_uri()

    # Swift Object Storage Configuration
    SWIFT_AUTH_URL = os.environ.get('SWIFT_AUTH_URL') # e.g., 'http://YOUR_VM_IP/identity/v3'
    SWIFT_USER = os.environ.get('SWIFT_USER')
    SWIFT_KEY = os.environ.get('SWIFT_KEY') # This is the password
    SWIFT_CONTAINER = os.environ.get('SWIFT_CONTAINER')
    
    
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
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    REDIS_URL = os.environ.get('REDIS_URL')
    
    @staticmethod
    def init_app(app):
        pass

class DevelopmentConfig(Config):
    """Configuration for development."""
    DEBUG = True

class TestingConfig(Config):
    """Configuration for testing."""
    TESTING = True
    # For testing, you might want a separate test database
    WTF_CSRF_ENABLED = False 

class ProductionConfig(Config):
    """Configuration for production."""
    # Add other production-specific settings here
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
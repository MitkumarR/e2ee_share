import os
from dotenv import load_dotenv

load_dotenv()

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
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') # Must match the auth service
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = get_postgres_uri()

config = {
    'development': Config,
    'production': Config,
    'default': Config
}
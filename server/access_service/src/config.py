import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    REDIS_URL = os.environ.get('REDIS_URL')

config = {
    'development': Config,
    'default': Config
}
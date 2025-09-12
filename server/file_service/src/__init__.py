from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from src.config import config

db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_name='default'):
    app = Flask(__name__)
    
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Define the specific origins that are allowed to make requests.
    allowed_origins = [
        "http://localhost:5173",  # For local development with `docker-compose`
        "http://e2eeshare.local"    # For your Kubernetes deployment via Ingress
    ]
    
    CORS(
        app,
        origins=allowed_origins,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True # Important for sending auth tokens
    )

    db.init_app(app)
    jwt.init_app(app)

    from src.routes import file_bp
    app.register_blueprint(file_bp)
    
    with app.app_context():
        db.create_all()

    return app
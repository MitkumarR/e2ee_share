# src/auth_service/__init__.py
# This file initializes the Flask application and its extensions.

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from src.config import config  # Use relative import

# Initialize extensions without attaching them to a specific app instance yet.
db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()

def create_app(config_name='default'):
    """
    Application factory function.
    Creates and configures the Flask app based on the provided config name.
    """
    app = Flask(__name__)
    
    # Load configuration from the config object
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    CORS(app)

    # Initialize extensions with the app instance
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # Import and register the blueprint from the routes module
    # Use a relative import here as well
    from src.routes import auth_bp
    app.register_blueprint(auth_bp)
    
    # Create database tables if they don't exist within the app context
    with app.app_context():
        db.create_all()

    return app

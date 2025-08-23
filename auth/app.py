# /auth-services/app.py

from flask import Flask
from config import config_by_name
from extensions import db, bcrypt, jwt, migrate
from routes.auth_routes import auth_bp

def create_app(config_name='development'):
    """Application factory function."""
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db) # Initialize Flask-Migrate

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(port=5001, debug=True) # Running on port 5001 to avoid conflicts
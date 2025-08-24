from flask import Flask
from config import config_by_name
from extensions import db, jwt, migrate
from routes.file_routes import file_bp # Import the new blueprint

def create_app(config_name='development'):
    """Application factory function."""
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Make sure to set an uploads folder if you want to configure it
    app.config['UPLOAD_FOLDER'] = 'uploads'

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    app.register_blueprint(file_bp, url_prefix='/files') # Register the file blueprint

    return app

if __name__ == '__main__':
    app = create_app()
    # Run on a different port than your auth service
    app.run(port=5002, debug=True)
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
    
    CORS(app)

    db.init_app(app)
    jwt.init_app(app)

    from src.routes import file_bp
    app.register_blueprint(file_bp)
    
    with app.app_context():
        db.create_all()

    return app
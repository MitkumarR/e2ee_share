from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_redis import FlaskRedis
from src.config import config

jwt = JWTManager()
redis_client = FlaskRedis()

def create_app(config_name='default'):
    app = Flask(__name__)
    
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    CORS(app, resources={r"/*": {"origins": "*"}})
     
    jwt.init_app(app)
    redis_client.init_app(app)

    from src.routes import access_bp
    app.register_blueprint(access_bp)

    return app
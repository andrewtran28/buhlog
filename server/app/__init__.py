import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object("config.Config")

    # Setup Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

    # Ensure model is loaded before migration
    from app.models import User

    # Import and register blueprints
    from app.routes.user_routes import user_bp
    from app.routes.auth_routes import auth_bp
    from app.routes.post_routes import post_bp

    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(post_bp, url_prefix="/api/posts")

    return app

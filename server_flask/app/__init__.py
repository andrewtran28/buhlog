import os
from flask import Flask, jsonify
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
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

    # Disable strict slashes so that a missing slash doesn't cause a redirect
    app.url_map.strict_slashes = False

    # Setup Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(
        app,
        resources={r"/api/*": {"origins": os.getenv("FRONTEND_URL", "*")}},
        supports_credentials=True,
    )

    # Ensure model is loaded before migration
    from app.models import User, Post, Comment, Session

    # Import and register blueprints
    from app.routes.user_routes import user_bp
    from app.routes.auth_routes import auth_bp
    from app.routes.post_routes import posts_bp

    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(posts_bp, url_prefix="/api/post")

    # Error handlers returning JSON responses
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500

    return app

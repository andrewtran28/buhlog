from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask import jsonify, g
from datetime import timedelta
from app.models import User


def generate_token(user):
    payload = {"id": user.id, "username": user.username, "is_author": user.is_author}
    return create_access_token(identity=payload, expires_delta=timedelta(days=3))


def jwt_user_required(func):
    @jwt_required()
    def wrapper(*args, **kwargs):
        identity = get_jwt_identity()
        if not identity:
            return jsonify({"message": "Invalid or expired token"}), 401

        user = User.query.get(identity["id"])
        if not user:
            return jsonify({"message": "User not found"}), 404

        g.current_user = user
        return func(*args, **kwargs)

    wrapper.__name__ = func.__name__  # avoid Flask issues with decorated routes
    return wrapper

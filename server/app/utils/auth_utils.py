from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask import jsonify, g
from datetime import timedelta
from app.models import User


def generate_token(user):
    additional_claims = {
        "id": user.id,
        "username": user.username,
        "isAuthor": user.is_author,
    }
    token = create_access_token(
        identity=str(user.id),
        additional_claims=additional_claims,
        expires_delta=timedelta(days=3),
    )
    print(f"\nGenerated JWT for user '{user.username}':\n{token}\n")
    return token


def jwt_user_required(func):
    @jwt_required()  # Ensures the route is protected and requires JWT
    def wrapper(*args, **kwargs):
        identity = get_jwt_identity()
        if not identity:
            return jsonify({"message": "Invalid or expired token"}), 401

        user = User.query.get(int(identity))
        if not user:
            return jsonify({"message": "User not found"}), 404

        g.current_user = user  # Set the current_user in Flask's g object
        return func(*args, **kwargs)  # Continue executing the route function

    wrapper.__name__ = (
        func.__name__
    )  # Ensure Flask correctly handles the decorated route
    return wrapper

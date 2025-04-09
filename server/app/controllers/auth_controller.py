from flask import jsonify, g
from app.models import User
import bcrypt
from app.utils.auth_utils import generate_token, jwt_user_required


@jwt_user_required
def get_current_user():
    user = g.current_user
    return jsonify({"success": True, "user": user.to_dict()}), 200


def login_user(data):
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user or not bcrypt.checkpw(
        password.encode("utf-8"), user.password.encode("utf-8")
    ):
        return jsonify({"message": "Invalid username or password"}), 401

    token = generate_token(user)

    user_data = {"id": user.id, "username": user.username, "isAuthor": user.is_author}
    return (
        jsonify({"message": "Login successful.", "token": token, "user": user_data}),
        200,
    )


def logout_user():
    # Logout can be handled on the frontend by removing token
    response = jsonify({"message": "Logout successful."})
    response.delete_cookie("token")
    return response, 200

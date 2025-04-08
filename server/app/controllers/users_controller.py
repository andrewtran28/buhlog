from flask import jsonify, g
from app.models import User
from app import db
import bcrypt
from app.utils.auth_utils import generate_token


def create_user(data):
    username = data.get("username")
    password = data.get("password")
    is_author = data.get("isAuthor", False)

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode(
        "utf-8"
    )
    user = User(username=username, password=hashed_pw, is_author=is_author)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created!"}), 201


def login(data):
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8")):
        token = generate_token(user)
        return jsonify({"access_token": token}), 200

    return jsonify({"message": "Invalid credentials"}), 401


def get_user_info():
    user = g.current_user
    return (
        jsonify({"id": user.id, "username": user.username, "isAuthor": user.is_author}),
        200,
    )


def delete_user():
    user = g.current_user
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200

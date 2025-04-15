from flask import jsonify, g
from app.models import User
from app import db
import bcrypt
from app.utils.auth_utils import generate_token, jwt_user_required


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


@jwt_user_required
def get_user_info():
    user = g.current_user

    published_posts_count = len([post for post in user.posts if post.published])
    drafts_count = len(user.posts) - published_posts_count
    comments_count = len(user.comments)
    is_author = published_posts_count > 0

    user_data = {
        "id": user.id,
        "username": user.username,
        "isAuthor": is_author,
        "posts": published_posts_count,
        "drafts": drafts_count,
        "comments": comments_count,
    }

    return jsonify(user_data), 200


def delete_user():
    user = g.current_user
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200

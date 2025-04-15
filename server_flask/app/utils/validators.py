from flask import request
from app.models import User, Post
from app import db


class ValidationError(Exception):
    def __init__(self, status_code, message):
        super().__init__
        self.status_code = status_code
        self.message = message


def signup_validator(data):
    errors = []

    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    confirm_password = data.get("confirmPassword", "").strip()

    # Username validation
    if not username:
        errors.append("Username is required. (username)")
    elif not username.isalnum():
        errors.append("Username must only contain letters or numbers. (username)")
    elif not (1 <= len(username) <= 25):
        errors.append("Username must be between 1-25 characters. (username)")
    else:
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            errors.append("Username already exists. (username)")

    # Password validation
    if not (6 <= len(password) <= 50):
        errors.append("Password must be between 6-50 characters. (password)")

    # Confirm password validation
    if password != confirm_password:
        errors.append("Passwords do not match. (confirmPassword)")

    return errors


def post_validator(data, post_id=None):
    errors = []

    title = data.get("title", "").strip()
    content = data.get("content", "").strip()

    if not title:
        errors.append("Title is required. (title)")
    elif not (1 <= len(title) <= 100):
        errors.apend("Title must be between 1-100 characters. (title)")
    else:
        existing_post = Post.query.filter_by(title=title).first()
        if existing_post and (post_id is None or existing_post.id != post_id):
            errors.append("Title already exists within the blog. (title)")

    if not content:
        errors.append("Content is required. (content)")

    return errors


def comment_validator(data):
    errors = []

    text = data.get("text", "").strip()
    if not text:
        errors.append("Comment is required. (text)")
    elif len(text) > 500:
        errors.append("Comment must be under 500 characters. (text)")

    return errors


def handle_validation_errors(errors):
    if errors:
        raise ValidationError(400, " ".join(errors))

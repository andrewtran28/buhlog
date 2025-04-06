from flask import Blueprint, jsonify, request
from app import db
from app.models import User, Post

main = Blueprint("main", __name__)


@main.route("/")
def home():
    return jsonify({"message": "Welcome to the Flask Blog API!"})


@main.route("/posts", methods=["GET"])
def get_posts():
    posts = Post.query.all()
    return jsonify([{"title": post.title, "content": post.content} for post in posts])

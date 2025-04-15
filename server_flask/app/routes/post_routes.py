from flask import Blueprint, request
from app.controllers import posts_controller
from app.controllers import comments_controller
from app.utils.auth_utils import jwt_user_required
from app.utils.validators import (
    post_validator,
    comment_validator,
    handle_validation_errors,
)

posts_bp = Blueprint("posts", __name__)


# Posts Routing
@posts_bp.route("/", methods=["GET"])
def get_all_posts():
    return posts_controller.get_all_posts()


@posts_bp.route("/drafts", methods=["GET"])
@jwt_user_required
def get_all_drafts():
    return posts_controller.get_all_drafts()


@posts_bp.route("/<string:post_slug>", methods=["GET"])
def get_post_by_slug(post_slug):
    return posts_controller.get_post_by_slug(post_slug)


@posts_bp.route("/", methods=["POST"])
@jwt_user_required
def create_post():
    data = request.get_json()
    errors = post_validator(data)
    handle_validation_errors(errors)
    return posts_controller.create_post(data)


@posts_bp.route("/<int:post_id>/edit", methods=["GET"])
def get_post_by_id(post_id):
    return posts_controller.get_post_by_id(post_id)


@posts_bp.route("/<int:post_id>", methods=["PUT"])
@jwt_user_required
def edit_post(post_id):
    data = request.get_json()
    errors = post_validator(data, post_id)
    handle_validation_errors(errors)
    return posts_controller.edit_post(post_id, data)


@posts_bp.route("/<int:post_id>", methods=["DELETE"])
@jwt_user_required
def delete_post(post_id):
    return posts_controller.delete_post(post_id)


# Comments Routing
@posts_bp.route("/<string:post_slug>/comments", methods=["GET"])
def get_comments(post_slug):
    return comments_controller.get_comments(post_slug)


@posts_bp.route("/<string:post_slug>/comments", methods=["POST"])
@jwt_user_required
def create_comment(post_slug):
    data = request.get_json()
    errors = comment_validator(data)
    handle_validation_errors(errors)
    return comments_controller.create_comment(post_slug, data)


@posts_bp.route("/<string:post_slug>/comments/<int:comment_id>", methods=["PUT"])
@jwt_user_required
def edit_comment(post_slug, comment_id):
    data = request.get_json()
    errors = comment_validator(data)
    handle_validation_errors(errors)
    return comments_controller.edit_comment(comment_id, data)


@posts_bp.route("/<string:post_slug>/comments/<int:comment_id>", methods=["DELETE"])
@jwt_user_required
def delete_comment(post_slug, comment_id):
    return comments_controller.delete_comment(comment_id)

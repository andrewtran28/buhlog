from flask import Blueprint
from app.controllers import users_controller
from app.utils.auth_utils import authenticate_token

# from app.utils.validator import signup_validator

user_bp = Blueprint("users", __name__)

user_bp.route("/", methods=["GET"])(users_controller.get_user_info)
user_bp.route("/", methods=["POST"])(users_controller.create_user)
user_bp.route("/", methods=["DELETE"])(users_controller.delete_user)

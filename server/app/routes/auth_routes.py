from flask import Blueprint, request
from app.controllers import auth_controller
from app.auth_utils import jwt_user_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/", methods=["GET"])
@jwt_user_required
def get_current_user():
    return auth_controller.get_current_user()


@auth_bp.route("/", methods=["POST"])
def login_user():
    data = request.get_json()
    return auth_controller.login_user(data)


@auth_bp.route("/", methods=["DELETE"])
@jwt_user_required
def logout_user():
    return auth_controller.logout_user()

from flask import Blueprint, request, jsonify
from app.controllers import users_controller
from app.utils.validator import (
    signup_validator,
    handle_validation_errors,
    ValidationError,
)
from flask_jwt_extended import jwt_required

user_bp = Blueprint("users", __name__)


@user_bp.route("/", methods=["GET"])
@jwt_required()
def get_user_info_route():
    return users_controller.get_user_info()


@user_bp.route("/", methods=["POST"])
def create_user_route():
    data = request.get_json()
    errors = signup_validator(data)
    try:
        handle_validation_errors(errors)
    except ValidationError as e:
        return jsonify({"message": e.message}), e.status_code

    return users_controller.create_user(data)


@user_bp.route("/", methods=["DELETE"])
@jwt_required()
def delete_user_route():
    return users_controller.delete_user()

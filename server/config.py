import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://andrew-tran:Mister28!@localhost:5432/blog_api?schema=public",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "minglee_jwt_secret")
    # SECRET_KEY = os.getenv("SECRET_KEY", "minglee_jwt_secret")

from datetime import datetime
from flask_login import UserMixin
from app import db


class Session(db.Model):
    __tablename__ = "session"

    id = db.Column(db.String, primary_key=True)
    sid = db.Column(db.String, unique=True, nullable=False)
    data = db.Column(db.String, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)


class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(25), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    is_author = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    posts = db.relationship("Post", back_populates="user", cascade="all, delete-orphan")
    comments = db.relationship(
        "Comment", back_populates="user", cascade="all, delete-orphan"
    )

    def get_id(self):
        return str(self.id)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "isAuthor": self.is_author,
            "createdAt": self.created_at.isoformat(),
        }


class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String, unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    # Map the Python attribute "user_id" to the database column "userId"
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, name="userId"
    )
    published = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = db.relationship("User", back_populates="posts")
    comments = db.relationship(
        "Comment", back_populates="post", cascade="all, delete-orphan"
    )


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    text = db.Column(db.String(300), nullable=False)
    # Map to database column "userId"
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        name="userId",
    )
    # Map to database column "postId"
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        name="postId",
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = db.relationship("User", back_populates="comments")
    post = db.relationship("Post", back_populates="comments")

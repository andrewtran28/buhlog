from datetime import datetime
from flask_login import UserMixin
from app import db


class Session(db.Model):
    __tablename__ = (
        "Session"  # matches Prisma model name (table is not explicitly mapped)
    )

    id = db.Column(db.String, primary_key=True)
    sid = db.Column(db.String, unique=True, nullable=False)
    data = db.Column(db.String, nullable=False)
    expires_at = db.Column(
        db.DateTime, nullable=False, name="expiresAt"
    )  # Prisma: expiresAt


class User(db.Model, UserMixin):
    __tablename__ = "users"  # Prisma: @@map("users")

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(25), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    is_author = db.Column(
        db.Boolean, default=False, nullable=False, name="isAuthor"
    )  # Prisma: isAuthor
    created_at = db.Column(
        db.DateTime, default=datetime.utcnow, nullable=False, name="createdAt"
    )  # Prisma: createdAt

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
    __tablename__ = "posts"  # Prisma: @@map("posts")

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, name="userId"
    )  # Prisma: userId
    published = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(
        db.DateTime, default=datetime.utcnow, nullable=False, name="createdAt"
    )  # Prisma: createdAt
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        name="updatedAt",
    )  # Prisma: updatedAt
    slug = db.Column(db.String(255), unique=True, nullable=False)

    user = db.relationship("User", back_populates="posts")
    comments = db.relationship(
        "Comment", back_populates="post", cascade="all, delete-orphan"
    )


class Comment(db.Model):
    __tablename__ = "comments"  # Prisma: @@map("comments")

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    text = db.Column(db.String(500), nullable=False)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        name="userId",
    )  # Prisma: userId
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        name="postId",
    )  # Prisma: postId
    created_at = db.Column(
        db.DateTime, default=datetime.utcnow, nullable=False, name="createdAt"
    )  # Prisma: createdAt
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        name="updatedAt",
    )  # Prisma: updatedAt

    user = db.relationship("User", back_populates="comments")
    post = db.relationship("Post", back_populates="comments")

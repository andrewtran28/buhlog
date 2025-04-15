from flask import jsonify
from app import db
from app.models import Post, User, Comment
from flask_jwt_extended import get_jwt_identity
from datetime import datetime
from bleach import clean
from app.utils.slugify import generate_unique_slug


def get_all_posts():
    posts = Post.query.filter_by(published=True).order_by(Post.created_at.desc()).all()

    if not posts or len(posts) == 0:
        return jsonify([]), 200

    result = []
    for post in posts:
        result.append(
            {
                "id": post.id,
                "title": post.title,
                "slug": post.slug,
                "content": post.content,
                "published": post.published,
                "author": post.user.username,
                "createdAt": post.created_at,
                "comments": [
                    {"id": c.id, "text": c.text, "createdAt": c.created_at}
                    for c in post.comments
                ],
            }
        )

    return jsonify(result), 200


def get_all_drafts():
    user_id = get_jwt_identity()
    drafts = (
        Post.query.filter_by(published=False, user_id=user_id)
        .order_by(Post.created_at.desc())
        .all()
    )

    if not drafts:
        return jsonify([]), 200

    return (
        jsonify(
            [
                {
                    "id": d.id,
                    "title": d.title,
                    "content": d.content,
                    "published": d.published,
                    "createdAt": d.created_at,
                }
                for d in drafts
            ]
        ),
        200,
    )


def get_post_by_slug(slug):
    post = Post.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({"error": "Post not found."}), 404

    return (
        jsonify(
            {
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "published": post.published,
                "author": post.user.username,
                "createdAt": post.created_at,
                "comments": [
                    {"id": c.id, "text": c.text, "createdAt": c.created_at}
                    for c in post.comments
                ],
            }
        ),
        200,
    )


def get_post_by_id(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found."}), 404

    return (
        jsonify(
            {
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "published": post.published,
                "author": post.user.username,
                "createdAt": post.created_at,
            }
        ),
        200,
    )


def create_post(data):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_author:
        return jsonify({"error": "User must be an author to perform this action."}), 403

    sanitized_content = clean(data.get("content", ""))

    # Generate a unique slug for the post
    title = data.get("title", "")
    slug = generate_unique_slug(title, db.session)

    post = Post(
        title=title,
        slug=slug,  # Set the slug here
        content=sanitized_content,
        published=bool(data.get("published", False)),
        user_id=user.id,
        updated_at=datetime.utcnow(),
    )
    db.session.add(post)
    db.session.commit()

    return jsonify({"message": "Post created."}), 200


def delete_post(post_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_author:
        return jsonify({"error": "User must be an author to perform this action."}), 403

    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found."}), 404

    if post.user_id != user.id:
        return jsonify({"error": "You are not the author of this post."}), 403

    db.session.delete(post)
    db.session.commit()

    return jsonify({"message": "Post was successfully deleted."}), 200


def edit_post(post_id, data):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_author:
        return jsonify({"error": "User must be an author to perform this action."}), 403

    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found."}), 404

    if post.user_id != user.id:
        return jsonify({"error": "You are not the author of this post."}), 403

    new_title = data.get("title", post.title)
    new_content = data.get("content", post.content)
    new_published = data.get("published", post.published)

    is_publishing = new_published is True and not post.published

    # If title changed, regenerate slug
    if new_title != post.title:
        post.title = new_title
        post.slug = generate_unique_slug(new_title, db.session)

    post.content = new_content
    post.published = new_published

    if is_publishing:
        post.created_at = datetime.utcnow()

    db.session.commit()

    return (
        jsonify(
            {
                "message": f"Post: {post.title} was successfully edited.",
                "post": {
                    "id": post.id,
                    "title": post.title,
                    "slug": post.slug,
                    "content": post.content,
                    "published": post.published,
                    "createdAt": post.created_at,
                },
            }
        ),
        200,
    )

from flask import jsonify, g
from app import db
from app.models import Post, Comment, User


def get_comments(post_title):
    post = Post.query.filter_by(title=post_title).first()
    if not post:
        return jsonify({"error": "Post not found."}), 404

    comments = (
        Comment.query.filter_by(post_id=post.id)
        .join(User)
        .add_columns(User.username, Comment.id, Comment.text, Comment.created_at)
        .order_by(Comment.created_at.desc())
        .all()
    )

    result = []
    for comment in comments:
        result.append(
            {
                "id": comment.id,
                "text": comment.text,
                "username": comment.username,
                "createdAt": comment.created_at,
            }
        )

    return jsonify(result), 200


def create_comment(post_title, data):
    post = Post.query.filter_by(title=post_title).first()
    if not post:
        return jsonify({"error": "Post not found."}), 404

    new_comment = Comment(
        text=data.get("text"),
        user_id=g.current_user.id,
        post_id=post.id,
    )
    db.session.add(new_comment)
    db.session.commit()

    return jsonify({"message": "Comment created successfully."}), 201


def edit_comment(post_title, comment_id, data):
    comment = Comment.query.filter_by(id=comment_id).first()
    if not comment:
        return jsonify({"error": "Comment not found."}), 404

    if comment.user_id != g.current_user.id:
        return jsonify({"error": "You are not authorized to edit this comment."}), 403

    comment.text = data.get("text")
    db.session.commit()

    return jsonify({"message": "Comment successfully edited."}), 201


def delete_comment(post_title, comment_id):
    comment = Comment.query.filter_by(id=comment_id).first()
    if not comment:
        return jsonify({"error": "Comment not found."}), 404

    if comment.user_id != g.current_user.id:
        return jsonify({"error": "You are not authorized to delete this comment."}), 403

    db.session.delete(comment)
    db.session.commit()

    return jsonify({"message": "Comment deleted successfully."}), 200

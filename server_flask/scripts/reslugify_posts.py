import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app, db
from app.models import Post
from app.utils.slugify import generate_unique_slug


def reslugify_posts():
    app = create_app()
    with app.app_context():
        posts = Post.query.all()
        count = 0

        for post in posts:
            new_slug = generate_unique_slug(post.title, db.session)
            if post.slug != new_slug:
                print(
                    f"Updating slug for Post ID {post.id}: '{post.slug}' -> '{new_slug}'"
                )
                post.slug = new_slug
                count += 1

        if count > 0:
            db.session.commit()
            print(f"Updated {count} post slugs.")
        else:
            print("All slugs are already up to date.")


if __name__ == "__main__":
    reslugify_posts()

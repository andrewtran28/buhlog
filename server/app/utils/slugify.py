import re
import unicodedata
import uuid
from app.models import Post


def generate_unique_slug(title, db_session):
    # Normalize and remove unwanted characters
    base_slug = unicodedata.normalize("NFKD", title)
    base_slug = re.sub(r"[^\w\s-]", "", base_slug.lower())
    base_slug = re.sub(r"[\s_-]+", "-", base_slug).strip("-")

    # Fallback in case base_slug is empty (e.g., title is just "?" or emoji)
    if not base_slug:
        base_slug = f"post-{uuid.uuid4().hex[:8]}"

    slug = base_slug
    counter = 1

    while db_session.query(Post).filter_by(slug=slug).first() is not None:
        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug

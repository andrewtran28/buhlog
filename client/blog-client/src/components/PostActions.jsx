import { formatDate, updateDateTime } from "../utils/FormatDate";

function PostActions({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author}</p>
      <p>
        {formatDate(post.createdAt)} {updateDateTime(post.createdAt, post.updatedAt)}
      </p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

export default PostActions;

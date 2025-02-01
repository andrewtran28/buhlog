function PostActions({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>By {post.author}</p>
      <p>{post.createdAt}</p>
      <div>{post.content}</div>
    </article>
  );
}

export default PostActions;

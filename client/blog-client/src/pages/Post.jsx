import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { formatDate, updateDateTime } from "../utils/FormatDate";
import CommentsSection from "../components/CommentsSection";
import "../styles/Post.css";

function Post() {
  const { postTitle } = useParams();
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/post/${encodeURIComponent(postTitle)}`;
  const navigate = useNavigate();

  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setErrorMessage("");
      setPost(null); // Reset post to avoid stale data

      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (response.ok) {
          setPost(data);
        } else {
          setErrorMessage(data.message || "Post not found.");
        }
      } catch (error) {
        setErrorMessage("An error occurred while fetching the post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    fetchComments();
  }, [postTitle]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/comments`);
      const data = await response.json();
      if (response.ok) {
        setComments(data);
      } else {
        console.error("Failed to load comments.");
      }
    } catch (error) {
      console.error("An error occurred when fetching post comments.");
    }
  };

  if (loading) return <p>Loading post...</p>;
  if (errorMessage) return <p style={{ color: "red" }}>{errorMessage}</p>;

  return (
    <section id="article">
      {post ? (
        <>
          <h1 id="title">{post.title}</h1>
          <div className="article-top">
            <div>
              <span className="author">{post.author}</span> |{" "}
              <span className="article-date">
                {formatDate(post.createdAt)} {updateDateTime(post.createdAt, post.updatedAt)}
              </span>
            </div>
            {user && user.username === post.author && (
              <span>
                <button onClick={() => navigate(`/post/${post.id}/edit`)}>Edit Post</button>
              </span>
            )}
          </div>
          <hr />

          <div dangerouslySetInnerHTML={{ __html: post.content }} />

          <hr />

          {post.published ? (
            <CommentsSection
              comments={comments}
              user={user}
              token={token}
              API_URL={API_URL}
              setComments={setComments}
              fetchComments={fetchComments}
            />
          ) : (
            <p>Drafts do not allow comments.</p>
          )}
        </>
      ) : (
        <p>Post not found.</p>
      )}
    </section>
  );
}

export default Post;

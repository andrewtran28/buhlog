import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { formatDate, updateDateTime } from "../utils/FormatDate";
import CommentsSection from "../components/CommentsSection";
import Loading from "../components/Loading";
import "../styles/Post.css";

function Post() {
  const { postSlug } = useParams();
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/post/${encodeURIComponent(postSlug)}`;
  const navigate = useNavigate();

  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

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
  }, [postSlug]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/comments`);
      const data = await response.json();
      if (response.ok) {
        setComments(data);
        setLoadingComments(false);
      } else {
        console.error("Failed to load comments.");
      }
    } catch (error) {
      console.error("An error occurred when fetching post comments.");
    }
  };

  if (loading) return <Loading loadMessage="Loading post" />;
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
                {formatDate(post.createdAt)}
                <span className="article-updated">{updateDateTime(post.createdAt, post.updatedAt)}</span>
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
              loadingComments={loadingComments}
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

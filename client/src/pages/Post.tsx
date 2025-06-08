import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { formatDate, updateDateTime } from "../utils/FormatDate";
import CommentsSection from "../components/CommentsSection";
import Loading from "../components/Loading";
import ScrollToTop from "../components/ScrollToTop";
import "../styles/Post.css";
import "react-quill/dist/quill.snow.css";

type Post = {
  id: number;
  title: string;
  slug: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  published: boolean;
  comments: { id: number }[];
};

type Comment = {
  id: number;
  username: string;
  text: string;
  createdAt: string;
};

function Post() {
  const { postSlug } = useParams();
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/post/${encodeURIComponent(postSlug || "")}`;
  const navigate = useNavigate();

  const { user, token } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [showScrollToComments, setShowScrollToComments] = useState(false);
  const commentsRef = useRef<HTMLDivElement | null>(null);

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  useEffect(() => {
    const commentVisibility = () => {
      const pageHeight = document.body.scrollHeight;
      const windowHeight = window.innerHeight;

      if (pageHeight <= windowHeight * 1.5) {
        setShowScrollToComments(false);
        return;
      }

      const commentsTop = commentsRef.current?.getBoundingClientRect().top ?? Infinity;

      if (commentsTop <= window.innerHeight) {
        setShowScrollToComments(false);
      } else {
        setShowScrollToComments(true);
      }
    };

    commentVisibility();
    window.addEventListener("scroll", commentVisibility);
    window.addEventListener("resize", commentVisibility);

    return () => {
      window.removeEventListener("scroll", commentVisibility);
      window.removeEventListener("resize", commentVisibility);
    };
  }, []);

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

  if (loading) return <Loading loadMessage="Loading post" delay={500} />;
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
                <span className="article-updated"> {updateDateTime(post.createdAt, post.updatedAt)}</span>
              </span>
            </div>
            {user && user.username === post.author && (
              <span>
                <button onClick={() => navigate(`/post/${post.id}/edit`)}>Edit Post</button>
              </span>
            )}
          </div>
          <hr />

          <div className="ql-editor " dangerouslySetInnerHTML={{ __html: post.content }} />

          <hr />

          {post.published ? (
            <div ref={commentsRef}>
              <CommentsSection
                comments={comments}
                user={user}
                token={token || ""}
                API_URL={API_URL}
                setComments={setComments}
                fetchComments={fetchComments}
                loadingComments={loadingComments}
              />
            </div>
          ) : (
            <p>Drafts do not allow comments.</p>
          )}
        </>
      ) : (
        <p>Post not found.</p>
      )}

      <ScrollToTop />
      <button
        className={`scroll-to-comments ${showScrollToComments ? "visible" : ""}`}
        onClick={scrollToComments}
        title="Scroll to Comments"
      >
        💬
      </button>
    </section>
  );
}

export default Post;

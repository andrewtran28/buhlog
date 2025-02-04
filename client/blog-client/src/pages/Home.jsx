import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { formatDate } from "../utils/FormatDate";
import "../styles/Home.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Home = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/post`);
        const data = await response.json();
        if (response.ok) {
          setPosts(data);
        } else {
          setErrorMessage(data.message || "Failed to fetch posts.");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setErrorMessage("An error occurred while fetching posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (user?.isAuthor) {
      const fetchDrafts = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/post/drafts`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            setDrafts(data);
          } else {
            console.error("Failed to fetch draft posts.");
          }
        } catch (error) {
          console.error("An error occurred while fetching draft posts:", error);
        } finally {
          setLoadingDrafts(false);
        }
      };

      fetchDrafts();
    }
  }, [user, token]);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <section id="home">
        <div className="home-header">
          <h1 id="title">Latest Articles</h1>
          {user?.isAuthor && (
            <div>
              <Link to="/new-post">
                <button>Create New Post</button>
              </Link>
            </div>
          )}
        </div>

        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          <div className="latest-posts">
            {posts.map((post) => (
              <div key={post.id} className="post">
                <h2>
                  <Link to={`/post/${post.title}`}>{post.title}</Link>
                </h2>
                <span>
                  {post.author} | {formatDate(post.createdAt)}
                  {post.comments.length > 0 && ` | ${post.comments.length} Comments`}
                </span>
              </div>
            ))}
          </div>
        )}

        {user?.isAuthor && (
          <>
            <hr />
            <div>
              <h2>Your Drafts</h2>
              {drafts.length === 0 ? (
                <p>There are no drafts.</p>
              ) : loadingDrafts ? (
                <p>Loading drafts...</p>
              ) : (
                <div className="draft-posts">
                  {drafts.map((draft) => (
                    <div key={draft.id} className="draft">
                      <h3>
                        <Link to={`/post/${draft.id}/edit`}>{draft.title}</Link>
                      </h3>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default Home;

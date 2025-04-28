import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { formatDate } from "../utils/FormatDate";
import Loading from "../components/Loading";
import "../styles/Home.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const POSTS_PER_PAGE = 8;

type Post = {
  id: number;
  title: string;
  slug: string;
  author: string;
  createdAt: string;
  comments: { id: number }[];
};

type Draft = {
  id: number;
  title: string;
};

const Home = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

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

  if (loading) return <Loading loadMessage="Loading" delay={1000} />;

  return (
    <section id="home">
      <div className="home-header">
        <h1 id="title">Latest Articles</h1>
        {user?.isAuthor && (
          <Link to="/new-post">
            <button>+ Create New Post</button>
          </Link>
        )}
      </div>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {posts.length === 0 ? (
        <p>No posts have been published.</p>
      ) : (
        <>
          <div className="latest-posts">
            {currentPosts.map((post) => (
              <div key={post.id} className="post">
                <h2>
                  <Link to={`/post/${post.slug}`}>{post.title}</Link>
                </h2>
                <span>
                  {post.author} | {formatDate(post.createdAt)}
                  {post.comments.length > 0 && ` | ${post.comments.length} Comments`}
                </span>
              </div>
            ))}
          </div>

          <div className="pagination">
            {currentPage > 1 && <button onClick={() => setCurrentPage((prev) => prev - 1)}>⬅ Newer Posts</button>}
            {currentPage < totalPages && (
              <button onClick={() => setCurrentPage((prev) => prev + 1)}>Older Posts ➡</button>
            )}
          </div>
          <br />
        </>
      )}

      {user?.isAuthor && (
        <>
          <hr />

          <h2 className="draft-header">Your Drafts</h2>
          <div className="draft-cont">
            {loadingDrafts ? (
              <Loading loadMessage="Loading drafts" delay={1000} />
            ) : drafts.length === 0 ? (
              <p>There are no drafts.</p>
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
  );
};

export default Home;

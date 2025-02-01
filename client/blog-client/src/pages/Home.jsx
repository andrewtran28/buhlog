import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div>
        {user?.isAuthor && (
          <div>
            <Link to="/new-post">
              <button>Create New Post</button>
            </Link>
          </div>
        )}

        <h1>Articles</h1>

        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          <div className="latest-posts">
            {posts.map((post) => (
              <div key={post.id}>
                <h2>
                  <Link to={`/post/${post.title}`}>{post.title}</Link>
                </h2>
                <p>{post.content.slice(0, 100) + "..."}</p>
                <Link to={`/post/${post.title}`}>Read more</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;

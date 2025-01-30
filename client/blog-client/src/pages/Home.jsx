import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/posts`);
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <h1>Latest Blog Posts</h1>

        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          <div className="latest-posts">
            {posts.map((post) => (
              <div key={post.id} className="border p-4 rounded-lg shadow-md hover:shadow-lg transition">
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-700">{post.content.slice(0, 100) + "..."}</p>
                <Link to={`/post/${post.id}`} className="text-blue-500 hover:underline mt-2 inline-block">
                  Read more
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function EditPost() {
  const { postId } = useParams();
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/post`;

  const { token } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [updatedContent, setUpdatedContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${API_URL}/${postId}/edit`);
        const data = await response.json();
        if (response.ok) {
          setPost(data);
          setUpdatedTitle(data.title);
          setUpdatedContent(data.content);
        } else {
          setErrorMessage(data.message || "Post not found.");
        }
      } catch (error) {
        console.error("Error fetching post data.");
      }
    };

    fetchPost();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!updatedTitle || !updatedContent) {
      setErrorMessage("Both title and content are required.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${post.id}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: updatedTitle, content: updatedContent }),
      });

      if (response.ok) {
        navigate(`/post/${updatedTitle}`);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Failed to update the post.");
      }
    } catch (error) {
      console.error("Error updating the post.");
    }
  };

  if (!post) {
    return <p>Loading post...</p>;
  }

  return (
    <div>
      <h1>Edit Post</h1>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input type="text" value={updatedTitle} onChange={(e) => setUpdatedTitle(e.target.value)} />
        </label>
        <br />
        <label>Content</label>
        <ReactQuill value={updatedContent} onChange={setUpdatedContent} modules={quillModules} />
        <br />
        <button type="submit">Update Post</button>
      </form>
    </div>
  );
}

const quillModules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ align: [] }],
    ["link"],
    [{ indent: "-1" }, { indent: "+1" }],
    ["blockquote"],
    [{ color: [] }, { background: [] }],
  ],
};

export default EditPost;

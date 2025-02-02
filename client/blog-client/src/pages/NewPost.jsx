import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function NewPost() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!user?.isAuthor) {
    return <p>You do not have permission to create a post.</p>; //return to homepage
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setErrorMessage("Title and content cannot be empty");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, published }),
      });

      const data = await response.json();
      if (response.ok) {
        navigate(`/post/${encodeURIComponent(title)}`);
      } else {
        setErrorMessage(data.message || "Failed to create post.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while creating the post.");
    }
  };

  return (
    <div>
      <h1>Create New Post</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label>Content</label>
        <ReactQuill value={content} onChange={setContent} modules={quillModules} />

        <label>
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publish
        </label>

        <button type="submit">Create Post</button>
      </form>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
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

export default NewPost;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../styles/NewPost.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function NewPost() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!user?.isAuthor) {
    return <p>You do not have permission to create a post.</p>;
  }

  const handleSubmit = async (e, isPublished) => {
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
        body: JSON.stringify({ title, content, published: isPublished }),
      });

      const data = await response.json();
      if (response.ok) {
        if (isPublished) {
          navigate(`/post/${data.post.slug}`);
        } else {
          navigate("/");
        }
      } else {
        setErrorMessage(data.message || "Failed to create post.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while creating the post.");
    }
  };

  return (
    <div id="new-post">
      <h1 id="title">Create New Post</h1>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <input
          className="title-input"
          type="text"
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />

        <ReactQuill className="quill" value={content} onChange={setContent} modules={quillModules} />

        <div className="new-post-btns">
          <button type="button" onClick={(e) => handleSubmit(e, false)}>
            Save Draft
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, true)}>
            Publish Post
          </button>
        </div>
      </form>
    </div>
  );
}

const quillModules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }],
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

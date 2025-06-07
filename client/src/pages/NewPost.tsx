import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import QuillEditor from "../components/QuillEditor";
import { getUsedImageUrls, deleteUnusedImages } from "../utils/QuillUtils";
import ScrollToTop from "../components/ScrollToTop";
import "../styles/NewPost.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function NewPost() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [uploadedImages, setUploadImages] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!user?.isAuthor) {
    return <p>You do not have permission to create a post.</p>;
  }

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e, false);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
    isPublished: boolean
  ) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setErrorMessage("Title and content cannot be empty");
      return;
    }

    const usedImageUrls = getUsedImageUrls(content);
    await deleteUnusedImages(uploadedImages, usedImageUrls, token, API_BASE_URL);

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
    } catch (err) {
      setErrorMessage("An error occurred while creating the post.");
    }
  };

  return (
    <div id="new-post">
      <h1 id="title">Create New Post</h1>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <form onSubmit={onFormSubmit}>
        <input
          className="title-input"
          type="text"
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />

        <QuillEditor
          token={token}
          content={content}
          setContent={setContent}
          uploadedImages={uploadedImages}
          setUploadedImages={setUploadImages}
        />

        <div className="new-post-btns">
          <button type="button" onClick={(e) => handleSubmit(e, false)}>
            Save Draft
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, true)}>
            Publish Post
          </button>
        </div>
      </form>
      <ScrollToTop />
    </div>
  );
}

export default NewPost;

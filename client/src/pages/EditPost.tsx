import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  published: boolean;
};

function EditPost() {
  const { postId } = useParams();
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/post`;

  const { token } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
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

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e, null);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
    publish: boolean | null
  ) => {
    e.preventDefault();

    if (!post) return;

    if (!updatedTitle || !updatedContent) {
      setErrorMessage("Both title and content are required.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: updatedTitle,
          content: updatedContent,
          published: publish !== null ? publish : post.published,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (post.published) {
          navigate(`/post/${data.post.slug}`);
        } else {
          navigate("/");
        }
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Failed to update the post.");
      }
    } catch (error) {
      console.error("Error updating the post.", error);
      setErrorMessage("An error occurred while updating the post.");
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${post.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        navigate("/");
      } else {
        console.error("Failed to delete post.");
      }
    } catch (error) {
      console.error("An error occurred while deleting the post.");
      setErrorMessage("An error occurred while deleting the post.");
    }
  };

  if (!post) {
    return <p>Loading post...</p>;
  }

  return (
    <div id="new-post">
      <h1 id="title">Edit Post</h1>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <form onSubmit={onFormSubmit}>
        <input
          className="title-input"
          type="text"
          value={updatedTitle}
          maxLength={100}
          onChange={(e) => setUpdatedTitle(e.target.value)}
          placeholder="Title"
        />

        <ReactQuill value={updatedContent} onChange={setUpdatedContent} modules={quillModules} />

        <div className="new-post-btns">
          <button type="button" onClick={(e) => handleSubmit(e, null)}>
            Save
          </button>
          <button type="button" onClick={(e) => handleSubmit(e, !post.published)}>
            {post.published ? "Unpublish" : "Publish"}
          </button>

          <button className="danger" type="button" onClick={handleDeletePost}>
            Delete Post
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
    [{ direction: "rtl" }],
    ["blockquote"],
    [{ color: [] }, { background: [] }],
  ],
};

export default EditPost;

import { useState } from "react";
import { formatDateTime } from "../utils/FormatDate";

function CommentsSection({ comments, user, token, API_URL, setComments, fetchComments }) {
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [commentError, setCommentError] = useState("");

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      const data = await response.json();
      if (response.ok) {
        setComments([...comments, data]);
        setNewComment("");
        setCommentError("");

        fetchComments();
      } else {
        setCommentError(data.message || "Failed to post comment.");
      }
    } catch (error) {
      setCommentError("An error occurred while posting the comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setComments(comments.filter((comment) => comment.id !== commentId));
      } else {
        console.error("Failed to delete comment.");
      }
    } catch (error) {
      console.error("An error occurred while deleting the comment.");
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: editedComment }),
      });

      if (response.ok) {
        setComments(
          comments.map((comment) => (comment.id === commentId ? { ...comment, text: editedComment } : comment))
        );
        setEditingComment(null);
      } else {
        console.error("Failed to edit comment.");
      }
    } catch (error) {
      console.error("An error occurred when editing the comment.");
    }
  };

  return (
    <section>
      <h2>Comments</h2>
      {comments.length > 0 ? (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <p>
                <strong>{comment.username}:</strong> {comment.text}
              </p>
              <p>{formatDateTime(comment.createdAt)}</p>
              {user && user.username === comment.username && (
                <div>
                  {editingComment === comment.id ? (
                    <div>
                      <textarea value={editedComment} onChange={(e) => setEditedComment(e.target.value)} rows="2" />
                      <button onClick={() => handleEditComment(comment.id)}>Save</button>
                      <button onClick={() => setEditingComment(null)}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                      <button
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditedComment(comment.text);
                        }}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}

      {user ? (
        <section>
          <h3>Post a Comment</h3>
          <form onSubmit={handleCommentSubmit}>
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} rows="3" />
            <button type="submit">Submit</button>
          </form>
          {commentError && <p style={{ color: "red" }}>{commentError}</p>}
        </section>
      ) : (
        <p>
          <Link to="/login">Log in</Link> to post a comment.
        </p>
      )}
    </section>
  );
}

export default CommentsSection;

import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDateTime } from "../utils/FormatDate";
import Loading from "../components/Loading";

function CommentsSection({ comments, user, token, API_URL, setComments, fetchComments, loadingComments }) {
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [commentError, setCommentError] = useState("");

  const handleTextInput = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `calc(${textarea.scrollHeight}px - 4px)`;
  };

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
    <div className="comments-section">
      {loadingComments ? (
        <Loading delay={500} loadMessage="Loading comments" />
      ) : (
        <>
          <h2>Comments {comments.length > 0 && `(${comments.length})`}</h2>
          {user ? (
            <div className="new-comment">
              <span>
                <strong>{user.username}: </strong>
              </span>
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onInput={handleTextInput}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength="300"
                  rows="1"
                />
                <button type="submit">Submit</button>
              </form>
              {commentError && <p style={{ color: "red" }}>{commentError}</p>}
            </div>
          ) : (
            <p>
              <Link to="/login">Log in</Link> to post a comment.
            </p>
          )}

          {comments.length > 0 ? (
            <ul>
              {comments.map((comment) => (
                <li key={comment.id}>
                  <div className="comment">
                    <div className="comment-top">
                      <strong>{comment.username}</strong>
                      <span className="comment-date">{formatDateTime(comment.createdAt)}</span>
                    </div>
                    {user && user.username === comment.username && (
                      <>
                        {editingComment === comment.id ? (
                          <div className="comment-edit">
                            <div className="comment-btns">
                              <button onClick={() => handleEditComment(comment.id)}>Save</button>
                              <button onClick={() => setEditingComment(null)}>Cancel</button>
                            </div>
                            <textarea
                              placeholder="Edit your comment..."
                              value={editedComment}
                              onChange={(e) => setEditedComment(e.target.value)}
                              maxLength="300"
                              rows="3"
                            />
                          </div>
                        ) : (
                          <div className="comment-btns">
                            <button
                              onClick={() => {
                                setEditingComment(comment.id);
                                setEditedComment(comment.text);
                              }}
                            >
                              Edit
                            </button>
                            <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                          </div>
                        )}
                      </>
                    )}
                    {editingComment !== comment.id && <span className="comment-text">{comment.text}</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No comments yet.</p>
          )}
        </>
      )}
    </div>
  );
}

export default CommentsSection;

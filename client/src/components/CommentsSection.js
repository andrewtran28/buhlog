var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDateTime } from "../utils/FormatDate";
import Loading from "../components/Loading";
function CommentsSection({ comments, user, token, API_URL, setComments, fetchComments, loadingComments, }) {
    const [newComment, setNewComment] = useState("");
    const [editingComment, setEditingComment] = useState(null);
    const [editedComment, setEditedComment] = useState("");
    const [commentError, setCommentError] = useState("");
    const handleTextInput = (e) => {
        const textarea = e.target;
        textarea.style.height = "auto";
        textarea.style.height = `calc(${textarea.scrollHeight}px - 4px)`;
    };
    const handleCommentSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        if (!newComment.trim())
            return;
        try {
            const response = yield fetch(`${API_URL}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: newComment }),
            });
            const data = yield response.json();
            if (response.ok) {
                setComments([...comments, data]);
                setNewComment("");
                setCommentError("");
                fetchComments();
            }
            else {
                setCommentError(data.message || "Failed to post comment.");
            }
        }
        catch (error) {
            setCommentError("An error occurred while posting the comment.");
        }
    });
    const handleDeleteComment = (commentId) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_URL}/comments/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setComments(comments.filter((comment) => comment.id !== commentId));
            }
            else {
                console.error("Failed to delete comment.");
            }
        }
        catch (error) {
            console.error("An error occurred while deleting the comment.");
        }
    });
    const handleEditComment = (commentId) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_URL}/comments/${commentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: editedComment }),
            });
            if (response.ok) {
                setComments(comments.map((comment) => (comment.id === commentId ? Object.assign(Object.assign({}, comment), { text: editedComment }) : comment)));
                setEditingComment(null);
            }
            else {
                console.error("Failed to edit comment.");
            }
        }
        catch (error) {
            console.error("An error occurred when editing the comment.");
        }
    });
    return (_jsx("div", { className: "comments-section", children: loadingComments ? (_jsx(Loading, { delay: 500, loadMessage: "Loading comments" })) : (_jsxs(_Fragment, { children: [_jsxs("h2", { children: ["Comments ", comments.length > 0 && `(${comments.length})`] }), user ? (_jsxs("div", { className: "new-comment", children: [_jsx("span", { children: _jsxs("strong", { children: [user.username, ": "] }) }), _jsxs("form", { onSubmit: handleCommentSubmit, children: [_jsx("textarea", { placeholder: "Add a comment...", value: newComment, onInput: handleTextInput, onChange: (e) => setNewComment(e.target.value), maxLength: 300, rows: 1 }), _jsx("button", { type: "submit", children: "Submit" })] }), commentError && _jsx("p", { style: { color: "red" }, children: commentError })] })) : (_jsxs("p", { children: [_jsx(Link, { to: "/login", children: "Log in" }), " to post a comment."] })), comments.length > 0 ? (_jsx("ul", { children: comments.map((comment) => (_jsx("li", { children: _jsxs("div", { className: "comment", children: [_jsxs("div", { className: "comment-top", children: [_jsx("strong", { children: comment.username }), _jsx("span", { className: "comment-date", children: formatDateTime(comment.createdAt) })] }), user && user.username === comment.username && (_jsx(_Fragment, { children: editingComment === comment.id ? (_jsxs("div", { className: "comment-edit", children: [_jsxs("div", { className: "comment-btns", children: [_jsx("button", { onClick: () => handleEditComment(comment.id), children: "Save" }), _jsx("button", { onClick: () => setEditingComment(null), children: "Cancel" })] }), _jsx("textarea", { placeholder: "Edit your comment...", value: editedComment, onChange: (e) => setEditedComment(e.target.value), maxLength: 300, rows: 3 })] })) : (_jsxs("div", { className: "comment-btns", children: [_jsx("button", { onClick: () => {
                                                    setEditingComment(comment.id);
                                                    setEditedComment(comment.text);
                                                }, children: "Edit" }), _jsx("button", { onClick: () => handleDeleteComment(comment.id), children: "Delete" })] })) })), editingComment !== comment.id && _jsx("span", { className: "comment-text", children: comment.text })] }) }, comment.id))) })) : (_jsx("p", { children: "No comments yet." }))] })) }));
}
export default CommentsSection;

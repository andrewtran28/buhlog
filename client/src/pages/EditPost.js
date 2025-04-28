var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        const fetchPost = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${API_URL}/${postId}/edit`);
                const data = yield response.json();
                if (response.ok) {
                    setPost(data);
                    setUpdatedTitle(data.title);
                    setUpdatedContent(data.content);
                }
                else {
                    setErrorMessage(data.message || "Post not found.");
                }
            }
            catch (error) {
                console.error("Error fetching post data.");
            }
        });
        fetchPost();
    }, [postId]);
    const onFormSubmit = (e) => {
        handleSubmit(e, null);
    };
    const handleSubmit = (e, publish) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        if (!post)
            return;
        if (!updatedTitle || !updatedContent) {
            setErrorMessage("Both title and content are required.");
            return;
        }
        try {
            const response = yield fetch(`${API_URL}/${post.id}`, {
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
                const data = yield response.json();
                if (post.published) {
                    navigate(`/post/${data.post.slug}`);
                }
                else {
                    navigate("/");
                }
            }
            else {
                const data = yield response.json();
                setErrorMessage(data.message || "Failed to update the post.");
            }
        }
        catch (error) {
            console.error("Error updating the post.", error);
            setErrorMessage("An error occurred while updating the post.");
        }
    });
    const handleDeletePost = () => __awaiter(this, void 0, void 0, function* () {
        if (!post)
            return;
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (!confirmDelete)
            return;
        try {
            const response = yield fetch(`${API_URL}/${post.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                navigate("/");
            }
            else {
                console.error("Failed to delete post.");
            }
        }
        catch (error) {
            console.error("An error occurred while deleting the post.");
            setErrorMessage("An error occurred while deleting the post.");
        }
    });
    if (!post) {
        return _jsx("p", { children: "Loading post..." });
    }
    return (_jsxs("div", { id: "new-post", children: [_jsx("h1", { id: "title", children: "Edit Post" }), errorMessage && _jsx("p", { style: { color: "red" }, children: errorMessage }), _jsxs("form", { onSubmit: onFormSubmit, children: [_jsx("input", { className: "title-input", type: "text", value: updatedTitle, maxLength: 100, onChange: (e) => setUpdatedTitle(e.target.value), placeholder: "Title" }), _jsx(ReactQuill, { value: updatedContent, onChange: setUpdatedContent, modules: quillModules }), _jsxs("div", { className: "new-post-btns", children: [_jsx("button", { type: "button", onClick: (e) => handleSubmit(e, null), children: "Save" }), _jsx("button", { type: "button", onClick: (e) => handleSubmit(e, !post.published), children: post.published ? "Unpublish" : "Publish" }), _jsx("button", { className: "danger", type: "button", onClick: handleDeletePost, children: "Delete Post" })] })] })] }));
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

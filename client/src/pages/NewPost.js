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
    if (!(user === null || user === void 0 ? void 0 : user.isAuthor)) {
        return _jsx("p", { children: "You do not have permission to create a post." });
    }
    const onFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit(e, false);
    };
    const handleSubmit = (e, isPublished) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setErrorMessage("Title and content cannot be empty");
            return;
        }
        try {
            const response = yield fetch(`${API_BASE_URL}/api/post`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content, published: isPublished }),
            });
            const data = yield response.json();
            if (response.ok) {
                if (isPublished) {
                    navigate(`/post/${data.post.slug}`);
                }
                else {
                    navigate("/");
                }
            }
            else {
                setErrorMessage(data.message || "Failed to create post.");
            }
        }
        catch (error) {
            setErrorMessage("An error occurred while creating the post.");
        }
    });
    return (_jsxs("div", { id: "new-post", children: [_jsx("h1", { id: "title", children: "Create New Post" }), errorMessage && _jsx("p", { style: { color: "red" }, children: errorMessage }), _jsxs("form", { onSubmit: onFormSubmit, children: [_jsx("input", { className: "title-input", type: "text", value: title, maxLength: 100, onChange: (e) => setTitle(e.target.value), placeholder: "Title", required: true }), _jsx(ReactQuill, { className: "quill", value: content, onChange: setContent, modules: quillModules }), _jsxs("div", { className: "new-post-btns", children: [_jsx("button", { type: "button", onClick: (e) => handleSubmit(e, false), children: "Save Draft" }), _jsx("button", { type: "button", onClick: (e) => handleSubmit(e, true), children: "Publish Post" })] })] })] }));
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

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
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { formatDate, updateDateTime } from "../utils/FormatDate";
import CommentsSection from "../components/CommentsSection";
import Loading from "../components/Loading";
import "../styles/Post.css";
function Post() {
    const { postSlug } = useParams();
    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/post/${encodeURIComponent(postSlug || "")}`;
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [post, setPost] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    useEffect(() => {
        const fetchPost = () => __awaiter(this, void 0, void 0, function* () {
            setLoading(true);
            setErrorMessage("");
            setPost(null); // Reset post to avoid stale data
            try {
                const response = yield fetch(API_URL);
                const data = yield response.json();
                if (response.ok) {
                    setPost(data);
                }
                else {
                    setErrorMessage(data.message || "Post not found.");
                }
            }
            catch (error) {
                setErrorMessage("An error occurred while fetching the post.");
            }
            finally {
                setLoading(false);
            }
        });
        fetchPost();
        fetchComments();
    }, [postSlug]);
    const fetchComments = () => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_URL}/comments`);
            const data = yield response.json();
            if (response.ok) {
                setComments(data);
                setLoadingComments(false);
            }
            else {
                console.error("Failed to load comments.");
            }
        }
        catch (error) {
            console.error("An error occurred when fetching post comments.");
        }
    });
    if (loading)
        return _jsx(Loading, { loadMessage: "Loading post", delay: 500 });
    if (errorMessage)
        return _jsx("p", { style: { color: "red" }, children: errorMessage });
    return (_jsx("section", { id: "article", children: post ? (_jsxs(_Fragment, { children: [_jsx("h1", { id: "title", children: post.title }), _jsxs("div", { className: "article-top", children: [_jsxs("div", { children: [_jsx("span", { className: "author", children: post.author }), " |", " ", _jsxs("span", { className: "article-date", children: [formatDate(post.createdAt), _jsx("span", { className: "article-updated", children: updateDateTime(post.createdAt, post.updatedAt) })] })] }), user && user.username === post.author && (_jsx("span", { children: _jsx("button", { onClick: () => navigate(`/post/${post.id}/edit`), children: "Edit Post" }) }))] }), _jsx("hr", {}), _jsx("div", { dangerouslySetInnerHTML: { __html: post.content } }), _jsx("hr", {}), post.published ? (_jsx(CommentsSection, { comments: comments, user: user, token: token || "", API_URL: API_URL, setComments: setComments, fetchComments: fetchComments, loadingComments: loadingComments })) : (_jsx("p", { children: "Drafts do not allow comments." }))] })) : (_jsx("p", { children: "Post not found." })) }));
}
export default Post;

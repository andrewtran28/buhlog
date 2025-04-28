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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { formatDate } from "../utils/FormatDate";
import Loading from "../components/Loading";
import "../styles/Home.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const POSTS_PER_PAGE = 8;
const Home = () => {
    const { user, token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingDrafts, setLoadingDrafts] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const currentPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);
    useEffect(() => {
        const fetchPosts = () => __awaiter(void 0, void 0, void 0, function* () {
            setLoading(true);
            try {
                const response = yield fetch(`${API_BASE_URL}/api/post`);
                const data = yield response.json();
                if (response.ok) {
                    setPosts(data);
                }
                else {
                    setErrorMessage(data.message || "Failed to fetch posts.");
                }
            }
            catch (error) {
                console.error("Error fetching posts:", error);
                setErrorMessage("An error occurred while fetching posts.");
            }
            finally {
                setLoading(false);
            }
        });
        fetchPosts();
    }, []);
    useEffect(() => {
        if (user === null || user === void 0 ? void 0 : user.isAuthor) {
            const fetchDrafts = () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const response = yield fetch(`${API_BASE_URL}/api/post/drafts`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const data = yield response.json();
                    if (response.ok) {
                        setDrafts(data);
                    }
                    else {
                        console.error("Failed to fetch draft posts.");
                    }
                }
                catch (error) {
                    console.error("An error occurred while fetching draft posts:", error);
                }
                finally {
                    setLoadingDrafts(false);
                }
            });
            fetchDrafts();
        }
    }, [user, token]);
    if (loading)
        return _jsx(Loading, { loadMessage: "Loading", delay: 1000 });
    return (_jsxs("section", { id: "home", children: [_jsxs("div", { className: "home-header", children: [_jsx("h1", { id: "title", children: "Latest Articles" }), (user === null || user === void 0 ? void 0 : user.isAuthor) && (_jsx(Link, { to: "/new-post", children: _jsx("button", { children: "+ Create New Post" }) }))] }), errorMessage && _jsx("p", { style: { color: "red" }, children: errorMessage }), posts.length === 0 ? (_jsx("p", { children: "No posts have been published." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "latest-posts", children: currentPosts.map((post) => (_jsxs("div", { className: "post", children: [_jsx("h2", { children: _jsx(Link, { to: `/post/${post.slug}`, children: post.title }) }), _jsxs("span", { children: [post.author, " | ", formatDate(post.createdAt), post.comments.length > 0 && ` | ${post.comments.length} Comments`] })] }, post.id))) }), _jsxs("div", { className: "pagination", children: [currentPage > 1 && _jsx("button", { onClick: () => setCurrentPage((prev) => prev - 1), children: "\u2B05 Newer Posts" }), currentPage < totalPages && (_jsx("button", { onClick: () => setCurrentPage((prev) => prev + 1), children: "Older Posts \u27A1" }))] }), _jsx("br", {})] })), (user === null || user === void 0 ? void 0 : user.isAuthor) && (_jsxs(_Fragment, { children: [_jsx("hr", {}), _jsx("h2", { className: "draft-header", children: "Your Drafts" }), _jsx("div", { className: "draft-cont", children: loadingDrafts ? (_jsx(Loading, { loadMessage: "Loading drafts", delay: 1000 })) : drafts.length === 0 ? (_jsx("p", { children: "There are no drafts." })) : (_jsx("div", { className: "draft-posts", children: drafts.map((draft) => (_jsx("div", { className: "draft", children: _jsx("h3", { children: _jsx(Link, { to: `/post/${draft.id}/edit`, children: draft.title }) }) }, draft.id))) })) })] }))] }));
};
export default Home;

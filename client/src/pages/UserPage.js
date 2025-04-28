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
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import Loading from "../components/Loading";
import "../styles/UserPage.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
function UserPage() {
    const { user, token, logout } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUserInfo = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`${API_BASE_URL}/api/users/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = yield response.json();
                if (response.ok) {
                    setUserInfo(data);
                }
                else {
                    setErrorMessage(data.message || "Failed to fetch user info.");
                }
            }
            catch (error) {
                console.error("Error fetching user info:", error);
                setErrorMessage("An error occurred while fetching user info.");
            }
        });
        if (user)
            fetchUserInfo();
    }, [token, user]);
    const handleDeleteAccount = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        if (!password) {
            setErrorMessage("Enter your password to delete the account.");
            return;
        }
        try {
            const response = yield fetch(`${API_BASE_URL}/api/users`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ password }),
            });
            const data = yield response.json();
            if (response.ok) {
                logout();
                navigate("/");
            }
            else {
                setErrorMessage(data.message || "Failed to delete account");
            }
        }
        catch (error) {
            console.error("Error deleting account:", error);
            setErrorMessage("An error occurred while deleting your account.");
        }
        finally {
            setPassword("");
        }
    });
    const handleCancel = () => {
        setShowDeleteForm(false);
        setPassword("");
        setErrorMessage("");
    };
    if (!user || !userInfo) {
        return _jsx(Loading, { loadMessage: "Loading user info", delay: 1000 });
    }
    return (_jsxs("div", { id: "user-page", children: [_jsx("h1", { id: "title", children: "Your Account" }), _jsxs("div", { className: "user-info", children: [_jsx("h2", { children: user.username }), _jsxs("p", { children: ["User ID: ", user.id] }), userInfo.isAuthor ? (_jsxs(_Fragment, { children: [_jsxs("p", { children: ["Role: ", _jsx("span", { style: { fontWeight: "600", color: "#ff124a" }, children: "Author" })] }), _jsxs("p", { children: ["Posts: ", userInfo.posts, " | Drafts: ", userInfo.drafts] }), _jsxs("p", { children: ["Comments: ", userInfo.comments] })] })) : (_jsxs(_Fragment, { children: [_jsxs("p", { children: ["Role: ", _jsx("span", { style: { color: "green" }, children: "Reader" })] }), _jsxs("p", { children: ["Comments: ", userInfo.comments] })] }))] }), _jsxs("div", { className: "delete-form", children: [!showDeleteForm && (_jsx("button", { className: "danger", onClick: () => setShowDeleteForm(true), children: "Delete Account" })), showDeleteForm && (_jsxs(_Fragment, { children: [_jsx("hr", {}), _jsxs("form", { onSubmit: handleDeleteAccount, children: [_jsx("h2", { className: "delete-confirm", children: "Confirm Account Deletion" }), _jsxs("div", { className: "delete-cont", children: [_jsx("p", { children: "Enter your password to delete your account." }), _jsx("input", { className: "delete-input", type: "password", placeholder: "Your password", value: password, maxLength: 50, onChange: (e) => setPassword(e.target.value), required: true }), _jsxs("div", { children: [_jsx("button", { className: "danger", type: "submit", children: "Delete Account" }), _jsx("button", { type: "button", onClick: handleCancel, children: "Cancel" })] })] })] })] }))] }), errorMessage && _jsx("p", { style: { color: "red" }, children: errorMessage })] }));
}
export default UserPage;

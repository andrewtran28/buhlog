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
import "../styles/Login.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Fetch from .env
function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const handleSignup = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        setErrorMessage("");
        try {
            const response = yield fetch(`${API_BASE_URL}/api/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, confirmPassword }),
            });
            const data = yield response.json();
            if (response.ok) {
                navigate("/login"); // Redirect to home
            }
            else {
                setErrorMessage(data.message);
                setUsername("");
                setPassword("");
                setConfirmPassword("");
            }
        }
        catch (error) {
            console.error("Network error:", error);
            setErrorMessage("An error occurred. Please try again later.");
        }
    });
    return (_jsxs("div", { id: "login", children: [_jsx("h1", { id: "title", children: "Sign Up" }), _jsxs("form", { onSubmit: handleSignup, children: [_jsx("label", { children: "Username:" }), _jsx("input", { name: "username", type: "text", value: username, maxLength: 25, onChange: (e) => setUsername(e.target.value), required: true }), _jsx("label", { children: "Password:" }), _jsx("input", { name: "password", type: "password", value: password, maxLength: 50, onChange: (e) => setPassword(e.target.value), required: true }), _jsx("label", { children: "Confirm Password:" }), _jsx("input", { name: "confirmPassword", type: "password", value: confirmPassword, maxLength: 50, onChange: (e) => setConfirmPassword(e.target.value), required: true }), _jsx("br", {}), errorMessage && (_jsxs("span", { style: { color: "red" }, children: [errorMessage, _jsx("br", {})] })), _jsx("button", { type: "submit", children: "Sign Up" })] })] }));
}
export default Signup;

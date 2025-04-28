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
import "../styles/Login.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Fetch from .env
function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleLogin = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        setErrorMessage("");
        try {
            const response = yield fetch(`${API_BASE_URL}/api/auth`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = yield response.json();
            if (response.ok) {
                login(data.token); // Store token in sessionStorage
                navigate("/"); // Redirect to home
            }
            else {
                console.error("Login failed:", data);
                setErrorMessage(data.message);
                setUsername("");
                setPassword("");
            }
        }
        catch (error) {
            console.error("Network error:", error);
            setErrorMessage("An error occurred. Please try again later.");
        }
    });
    return (_jsxs("div", { id: "login", children: [_jsx("h1", { id: "title", children: "Log In" }), _jsxs("form", { onSubmit: handleLogin, children: [_jsx("label", { htmlFor: "username", children: "Username: " }), _jsx("input", { type: "text", value: username, maxLength: 25, onChange: (e) => setUsername(e.target.value), required: true }), _jsx("label", { htmlFor: "password", children: " Password: " }), _jsx("input", { type: "password", value: password, maxLength: 50, onChange: (e) => setPassword(e.target.value), required: true }), _jsx("br", {}), errorMessage && (_jsxs("span", { style: { color: "red" }, children: [errorMessage, _jsx("br", {})] })), _jsx("button", { type: "submit", children: "Log In" })] })] }));
}
export default Login;

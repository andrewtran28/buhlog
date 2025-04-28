import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import "../styles/Header.css";
function Header() {
    const { user, logout } = useAuth();
    return (_jsx("header", { children: _jsxs("div", { id: "header-cont", children: [_jsxs("div", { className: "header-left", children: [_jsxs(Link, { to: "/", className: "logo", children: [_jsx("img", { className: "logo-img", src: "/logo.png" }), "Buhlog"] }), _jsx("span", { className: "pronunciation prevent-select", children: "(/bla:g/)" })] }), _jsx("nav", { children: user ? (_jsxs("div", { className: "header-right", children: [_jsxs("span", { children: [_jsx("span", { id: "hello", children: "Hello, " }), _jsx(Link, { to: `/users`, children: user.username })] }), _jsxs("div", { children: [_jsx(Link, { to: `/users`, children: _jsx("button", { children: "Your Account" }) }), _jsx("button", { onClick: logout, children: "Logout" })] })] })) : (_jsxs("div", { className: "header-right", children: [_jsx(Link, { to: "/login", children: _jsx("button", { children: "Login" }) }), _jsx(Link, { to: "/signup", children: _jsx("button", { children: "Sign Up" }) })] })) })] }) }));
}
export default Header;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import "../styles/Footer.css";
function Footer() {
    return (_jsx("footer", { children: _jsxs("span", { children: ["\u00A9 2025 ", _jsx(Link, { to: "https://github.com/andrewtran28/blog-api", children: "Buhlog" }), " by", " ", _jsx(Link, { to: "https://andrewtran-developer.netlify.app/home", children: "minglee" }), ". All rights reserved."] }) }));
}
export default Footer;

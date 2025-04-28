import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import "../styles/App.css";
const Loading = ({ delay = 1000, loadMessage }) => {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const timeout = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(timeout);
    }, [delay]);
    return (_jsx("div", { className: "loading", children: _jsxs("h1", { className: show ? "show" : "", children: [loadMessage, _jsx("span", { className: "load-animation", children: "..." })] }) }));
};
export default Loading;

import { jsx as _jsx } from "react/jsx-runtime";
// import "../styles/ErrorPage.css";
// import Header from "./Header";
function ErrorPage() {
    return (_jsx("div", { children: _jsx("main", { id: "error-cont", children: _jsx("h1", { children: "Uh oh.. Looks like this page doesn't exist or is under construction!" }) }) }));
}
export default ErrorPage;

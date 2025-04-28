import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Home from "./pages/Home";
import Post from "./pages/Post";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserPage from "./pages/UserPage";
import NewPost from "./pages/NewPost";
import EditPost from "./pages/EditPost";
import ErrorPage from "./pages/ErrorPage";
import Footer from "./components/Footer";
const App = () => {
    return (_jsx(_Fragment, { children: _jsx(AuthProvider, { children: _jsx(Router, { children: _jsxs("div", { id: "page-layout", children: [_jsxs("div", { children: [_jsx(Header, {}), _jsx("main", { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/post/:postSlug", element: _jsx(Post, {}) }), _jsx(Route, { path: "/post/:postId/edit", element: _jsx(ProtectedRoute, { element: _jsx(EditPost, {}) }) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/signup", element: _jsx(Signup, {}) }), _jsx(Route, { path: "/users/", element: _jsx(ProtectedRoute, { element: _jsx(UserPage, {}) }) }), _jsx(Route, { path: "/new-post", element: _jsx(ProtectedRoute, { element: _jsx(NewPost, {}) }) }), _jsx(Route, { path: "*", element: _jsx(ErrorPage, {}) })] }) })] }), _jsx(Footer, {})] }) }) }) }));
};
export default App;

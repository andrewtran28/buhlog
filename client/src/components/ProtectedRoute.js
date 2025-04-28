import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
const ProtectedRoute = ({ element }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return null;
    }
    return user ? element : _jsx(Navigate, { to: "/login", replace: true });
};
export default ProtectedRoute;

import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
const AuthContext = createContext(undefined);
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const storedToken = sessionStorage.getItem("token");
        if (storedToken) {
            try {
                const decoded = jwtDecode(storedToken);
                setUser(decoded);
                setToken(storedToken);
            }
            catch (error) {
                console.error("Invalid token", error);
                sessionStorage.removeItem("token");
            }
        }
        setLoading(false); // Stop loading after checking the token
    }, []);
    const login = (newToken) => {
        sessionStorage.setItem("token", newToken);
        const decoded = jwtDecode(newToken);
        setUser(decoded);
        setToken(newToken);
    };
    const logout = () => {
        sessionStorage.removeItem("token");
        setUser(null);
        setToken(null);
    };
    if (loading) {
        return null;
    }
    return _jsx(AuthContext.Provider, { value: { user, token, login, logout, loading }, children: children });
};
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
export { AuthProvider, useAuth };

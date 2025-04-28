import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

type User = {
  id: number;
  username: string;
  isAuthor: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode<User>(storedToken);
        setUser(decoded);
        setToken(storedToken);
      } catch (error) {
        console.error("Invalid token", error);
        sessionStorage.removeItem("token");
      }
    }

    setLoading(false); // Stop loading after checking the token
  }, []);

  const login = (newToken: string) => {
    sessionStorage.setItem("token", newToken);
    const decoded = jwtDecode<User>(newToken);
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

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };

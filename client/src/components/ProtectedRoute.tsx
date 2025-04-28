import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

type ProtectedRouteProps = {
  element: ReactElement;
};

const ProtectedRoute = ({ element }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return user ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

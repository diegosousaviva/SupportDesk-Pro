import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

function ProtectedRoute() {
  const { authenticated } = useAuth();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
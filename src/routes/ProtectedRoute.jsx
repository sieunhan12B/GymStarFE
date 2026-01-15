import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { path } from "../common/path";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useSelector((state) => state.userSlice);

  if (loading) {
    return <div>Loading...</div>; // hoặc Spinner
  }

  if (!user) {
    return <Navigate to={path.logIn} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role_name)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

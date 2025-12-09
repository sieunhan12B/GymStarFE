import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { path } from "../common/path";

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = useSelector((state) => state.userSlice.user);
  console.log(user);

  if (!user) {
    return <Navigate to={path.logIn} replace />;
  }

  if (!allowedRoles.includes(user.role_id)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { path } from "../common/path";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useSelector((state) => state.userSlice);

  // ⏳ ĐANG CHỜ API LẤY USER
  if (loading) {
    return <div>Loading...</div>; // hoặc Spinner
  }

  // ❌ LOAD XONG NHƯNG KHÔNG CÓ USER
  if (!user) {
    return <Navigate to={path.logIn} replace />;
  }

  // ❌ CÓ USER NHƯNG KHÔNG ĐỦ QUYỀN
  if (allowedRoles && !allowedRoles.includes(user.role_id)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

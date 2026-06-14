import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Same preview switch as ProtectedRoute: when VITE_BYPASS_AUTH=true, skip the
// sign-in check. Set VITE_BYPASS_ROLE=instructor to preview instructor routes.
const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";

// Wrap any instructor-only route. Students (or signed-out users) are redirected
// away: signed-out → /signin, signed-in non-instructors → home (/).
export default function InstructorRoute({ children }) {
  const { currentUser, isInstructor } = useAuth();
  const location = useLocation();

  if (!currentUser && !BYPASS_AUTH) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  if (!isInstructor) {
    return <Navigate to="/" replace />;
  }
  return children;
}

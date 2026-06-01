import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Preview switch: when VITE_BYPASS_AUTH=true in .env, skip the sign-in check
// so you can browse the app without an account. Turn this OFF before going
// live (set it to false or remove the line).
const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";

// Wrap any route that requires sign-in. If there's no user, redirect to
// /signin and remember where they were trying to go.
export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser && !BYPASS_AUTH) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  return children;
}

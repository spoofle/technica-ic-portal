import { useAuth } from "../context/AuthContext";
import Dashboard from "../pages/Dashboard";
import InstructorHome from "../pages/instructor/InstructorHome";

// The "/" landing page is role-aware: instructors get their overview, students
// get the lesson dashboard. AuthContext resolves the role before routes render,
// so this never flashes the wrong page.
export default function HomeRoute() {
  const { isInstructor } = useAuth();
  return isInstructor ? <InstructorHome /> : <Dashboard />;
}

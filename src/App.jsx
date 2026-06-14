import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LessonsProvider } from "./context/LessonsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import InstructorRoute from "./components/InstructorRoute";
import AppLayout from "./components/layout/AppLayout";
import HomeRoute from "./routes/HomeRoute";
import LessonPage from "./pages/LessonPage";
import MyJournal from "./pages/MyJournal";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import InstructorRoster from "./pages/instructor/InstructorRoster";
import StudentProgressDetail from "./pages/instructor/StudentProgressDetail";
import LessonManager from "./pages/instructor/LessonManager";
import LessonEditor from "./pages/instructor/LessonEditor";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth pages */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Authenticated app (sidebar + top bar shell). Lessons are loaded
              once for the whole signed-in experience. */}
          <Route
            element={
              <ProtectedRoute>
                <LessonsProvider>
                  <AppLayout />
                </LessonsProvider>
              </ProtectedRoute>
            }
          >
            {/* Role-aware landing: instructor overview vs. student dashboard */}
            <Route path="/" element={<HomeRoute />} />
            <Route path="/lessons/:lessonId" element={<LessonPage />} />
            <Route path="/journal" element={<MyJournal />} />

            {/* Instructor-only area */}
            <Route
              path="/students"
              element={
                <InstructorRoute>
                  <InstructorRoster />
                </InstructorRoute>
              }
            />
            <Route
              path="/students/:uid"
              element={
                <InstructorRoute>
                  <StudentProgressDetail />
                </InstructorRoute>
              }
            />
            <Route
              path="/manage"
              element={
                <InstructorRoute>
                  <LessonManager />
                </InstructorRoute>
              }
            />
            <Route
              path="/manage/lessons/new"
              element={
                <InstructorRoute>
                  <LessonEditor />
                </InstructorRoute>
              }
            />
            <Route
              path="/manage/lessons/:lessonId"
              element={
                <InstructorRoute>
                  <LessonEditor />
                </InstructorRoute>
              }
            />
          </Route>

          {/* Anything else -> home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

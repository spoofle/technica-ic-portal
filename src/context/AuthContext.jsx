// =========================================================================
// AuthContext — single source of truth for "who is signed in"
// -------------------------------------------------------------------------
// Wrap the app in <AuthProvider> and call useAuth() anywhere to get the
// current user, their profile (including role), plus signup/login/logout.
//
// Roles: every user has a `role` of "student" or "instructor" stored on
// their users/{uid} profile doc. The role is loaded after sign-in and
// exposed as `role` / `isInstructor` so routing and UI can branch on it.
// =========================================================================
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext(null);

// In preview mode (VITE_BYPASS_AUTH) there's no real user; optionally preview
// the instructor views by setting VITE_BYPASS_ROLE=instructor.
const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === "true";
const BYPASS_ROLE =
  import.meta.env.VITE_BYPASS_ROLE === "instructor" ? "instructor" : "student";

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create an account, set a display name, and seed a profile document with a
  // role. `role` is one of "student" | "instructor" (defaults to student).
  async function signup(email, password, displayName, role = "student") {
    const safeRole = role === "instructor" ? "instructor" : "student";

    // Step 1: create the auth account. If this throws, the error code tells us
    // exactly what's wrong (e.g. auth/operation-not-allowed = Email/Password
    // sign-in isn't enabled in the Firebase console).
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    // Step 2: save the profile document, including the role. This MUST happen
    // at create time so the Firestore `create` rule (which validates role) is
    // the one that applies. We optimistically set local profile state too.
    const profileData = {
      displayName: displayName || "",
      email,
      role: safeRole,
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, "users", cred.user.uid), profileData);
      setProfile({ ...profileData, createdAt: null });
    } catch (err) {
      // If this fails the account exists but has no role — log loudly so it's
      // obvious (most likely Firestore isn't created yet, or rules block it).
      console.error(
        "Account created, but saving the profile (with role) to Firestore " +
          "failed. The user will default to 'student' until this is fixed:",
        err
      );
    }

    return cred.user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Send a password-reset email. Firebase handles the reset link + new-password
  // page; we just trigger the email.
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function logout() {
    setProfile(null);
    return signOut(auth);
  }

  // Re-read the profile doc (e.g. after an external change). Safe to call
  // anytime; no-ops if there's no signed-in user.
  async function refreshProfile() {
    const user = auth.currentUser;
    if (!user) return null;
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : null;
      setProfile(data);
      return data;
    } catch (err) {
      console.error("Failed to load user profile:", err);
      return null;
    }
  }

  // Keep currentUser + profile in sync with Firebase's auth state.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setCurrentUser(user);
        if (user) {
          // Load the profile doc (with role) before we stop "loading", so
          // role-aware routing never flashes the wrong landing page.
          try {
            const snap = await getDoc(doc(db, "users", user.uid));
            setProfile(snap.exists() ? snap.data() : null);
          } catch (err) {
            console.error("Failed to load user profile:", err);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (err) => {
        // Auth init failed (e.g. config not set yet) — don't hang on a blank
        // screen; show the app so the sign-in page is reachable.
        console.error("Auth error:", err);
        setLoading(false);
      }
    );

    // Safety net: never block render for more than 5s waiting on auth.
    const timer = setTimeout(() => setLoading(false), 5000);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Derive role. In preview mode there's no profile, so fall back to the
  // bypass role; otherwise default to "student" if the profile lacks a role.
  const role =
    profile?.role || (BYPASS_AUTH && !currentUser ? BYPASS_ROLE : "student");
  const isInstructor = role === "instructor";

  const value = {
    currentUser,
    profile,
    role,
    isInstructor,
    signup,
    login,
    resetPassword,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

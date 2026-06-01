// =========================================================================
// AuthContext — single source of truth for "who is signed in"
// -------------------------------------------------------------------------
// Wrap the app in <AuthProvider> and call useAuth() anywhere to get the
// current user plus signup / login / logout helpers.
// =========================================================================
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create an account, set a display name, and seed a profile document.
  async function signup(email, password, displayName) {
    // Step 1: create the auth account. If this throws, the error code tells us
    // exactly what's wrong (e.g. auth/operation-not-allowed = Email/Password
    // sign-in isn't enabled in the Firebase console).
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    // Step 2: save a profile document. This is best-effort — if Firestore
    // isn't set up yet, we don't want to block the account from being created.
    try {
      await setDoc(doc(db, "users", cred.user.uid), {
        displayName: displayName || "",
        email,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn(
        "Account created, but saving the profile to Firestore failed " +
          "(is the Firestore database created?):",
        err
      );
    }

    return cred.user;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  // Keep currentUser in sync with Firebase's auth state.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
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

  const value = { currentUser, signup, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

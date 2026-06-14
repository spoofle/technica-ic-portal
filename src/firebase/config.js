// =========================================================================
// Firebase initialization
// -------------------------------------------------------------------------
// Values are read from environment variables (see .env.example). Vite only
// exposes variables prefixed with VITE_ to the browser. These keys are NOT
// secret (they identify your project to Firebase), but keeping them in .env
// keeps the codebase clean and makes it easy to swap projects.
// =========================================================================
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// ignoreUndefinedProperties: when we migrate content sections to the block
// model we clear old fields by setting them to undefined; this drops those
// undefined values on write instead of throwing.
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});
export default app;

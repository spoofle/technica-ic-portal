import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import WelcomePanel from "./WelcomePanel";
import "./auth.css";

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Please use a password with at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match. Please try again.");
      return;
    }

    setBusy(true);
    try {
      await signup(email, password, name);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Sign-up failed:", err.code, err.message);
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <WelcomePanel />
      <div className="auth__panel">
        <div className="auth__card">
          <h2>Create your account ✨</h2>
          <p className="auth__card-sub">Join the class and start learning.</p>

          {error && <div className="alert alert--error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              id="name"
              label="First name"
              type="text"
              autoComplete="given-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              hint="At least 6 characters."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              id="confirm"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <Button type="submit" block size="lg" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="auth__switch">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in isn't turned on yet. In the Firebase console, go to Authentication → Sign-in method → enable Email/Password.";
    case "auth/network-request-failed":
      return "Couldn't reach Firebase. Check your internet connection and that your .env config is correct.";
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
    case "auth/invalid-api-key":
      return "Your Firebase API key looks invalid. Double-check the values in your .env file.";
    case "auth/configuration-not-found":
      return "Firebase Authentication isn't set up for this project yet. Enable it in the Firebase console.";
    default:
      // Surface the raw code so we can diagnose anything not handled above.
      return `Something went wrong creating your account (${code || "unknown error"}). Please try again.`;
  }
}

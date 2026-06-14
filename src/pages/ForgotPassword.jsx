import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import WelcomePanel from "./WelcomePanel";
import "./auth.css";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await resetPassword(email);
      // Always show success — we don't reveal whether an email is registered.
      setSent(true);
    } catch (err) {
      console.error("Password reset failed:", err.code, err.message);
      // auth/user-not-found is intentionally treated as success below; only
      // surface real problems (bad email format, network, etc.).
      if (err.code === "auth/user-not-found") {
        setSent(true);
      } else {
        setError(friendlyError(err.code));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <WelcomePanel />
      <div className="auth__panel">
        <div className="auth__card">
          <h2>Reset your password 🔑</h2>
          <p className="auth__card-sub">
            Enter your email and we'll send you a link to choose a new password.
          </p>

          {error && <div className="alert alert--error">{error}</div>}

          {sent ? (
            <>
              <div className="alert alert--success">
                If an account exists for <strong>{email}</strong>, a reset link
                is on its way. Check your inbox (and spam folder).
              </div>
              <p className="auth__switch">
                <Link to="/signin">Back to sign in</Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <Input
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" block size="lg" disabled={busy}>
                {busy ? "Sending…" : "Send reset link"}
              </Button>

              <p className="auth__switch">
                Remembered it? <Link to="/signin">Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/missing-email":
      return "Please enter your email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Couldn't reach Firebase. Check your internet connection.";
    default:
      return "Something went wrong sending the reset email. Please try again.";
  }
}

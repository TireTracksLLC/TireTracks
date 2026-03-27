import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../SignIn.css";
import { signIn } from "../Services/auth";

export default function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(true);

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setIsError(true);
      setMessage("Please enter a valid email.");
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else {
      setIsError(false);
      setMessage("Signed in! Redirecting...");
      setTimeout(() => {
        navigate("/Dashboard");
      }, 800);
    }
  }

  return (
    <div className="signIn-Body">
      <div className="signIn-Card">
        <h1>Sign In</h1>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="signIn-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="signIn-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />

          <button className="signIn-button" type="submit">
            Sign In
          </button>

          {/* ✅ Back to Home Button */}
          <button
            type="button"
            className="back-home-btn"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </form>

        {message && (
          <div className={isError ? "error" : "ok"}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
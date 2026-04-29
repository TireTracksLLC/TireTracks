import { useState } from "react";
import { supabase } from "../../supabaseClient";
import "../SignIn.css";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(true);

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!isValidEmail(email)) {
      setIsError(true);
      return setMsg("Please enter a valid email.");
    }

    if (password.length < 6) {
      setIsError(true);
      return setMsg("Password must be at least 6 characters.");
    }

    if (password !== confirm) {
      setIsError(true);
      return setMsg("Passwords do not match.");
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { app: "TireTracks" }
      }
    });

    if (error) {
      setIsError(true);
      setMsg(error.message);
    } else {
      setIsError(false);
      setMsg("Account created! Check your email to confirm.");
    }
  };

  return (
    <div className="signIn-Body">
      <div className="signIn-Card">
        <h1>Sign Up</h1>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            className="signIn-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            className="signIn-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            className="signIn-input"
            type="password"
            placeholder="Confirm your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <button className="signIn-button" type="submit">
            Create Account
          </button>
        </form>

        {msg && (
          <p className={isError ? "error" : "ok"}>
            {msg}
          </p>
        )}

        <button
          className="back-home-btn"
          onClick={() => window.location.href = "/signin"}
        >
          Already have an account? Sign In
        </button>
      </div>
    </div>
  );
}
import { useState } from "react"
import { supabase } from "../../supabaseClient"
import '../SignIn.css'

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(true)

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage("")

    // Validation
    if (!isValidEmail(email)) {
      setIsError(true)
      return setMessage("Please enter a valid email.")
    }

    if (password.length < 6) {
      setIsError(true)
      return setMessage("Password must be at least 6 characters.")
    }

    // Supabase login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setIsError(true)
      return setMessage(error.message)
    }

    setIsError(false)
    setMessage("Signed in! Redirecting...")

    // Redirect (React way)
    window.location.href = "/Dashboard"
  }

  return (
       <div className="signIn-Body">
        <div className="signIn-Card">
          <h1>Sign In</h1>

          <form onSubmit={handleSubmit} noValidate>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button className="button-style" type="submit">
              Sign In
            </button>
          </form>

          <div className={isError ? "error" : "ok"}>
            {message}
          </div>
        </div>
      </div> 
  )
}
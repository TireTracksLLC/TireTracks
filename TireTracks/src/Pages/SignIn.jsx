import { useState } from "react"
import { supabase } from "../../TireTracks/supabaseClient"
import '../SignIn.css'
import { signIn } from "../Services/auth"

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

    if (!isValidEmail(email)) {
      setIsError(true)
      setMessage("Please enter a valid email.")
      return
    }

    const {error} = await signIn(email, password)

    if (error) {
      setIsError(true)
      return setMessage(error.message)
    } else {
      setIsError(false)
      setMessage("Signed in! Redirecting...")
      window.location.href = "/Dashboard"
    }    

    
  }

  return (
       <div className="signIn-Body">
        <div className="signIn-Card">
          <h1>Sign In</h1>

        <form onSubmit={handleSubmit} noValidate>
          <label>Email</label>
          <input
            className="signIn-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label>Password</label>
          <input
            className="signIn-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button className="signIn-button" type="submit">
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
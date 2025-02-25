// pages/login.tsx

import { useSession, signIn, signOut } from "next-auth/react"
import 'bootstrap/dist/css/bootstrap.min.css'

export default function LoginPage() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
        <h1 className="text-success">Welcome, {session.user?.email ?? 'User'}!</h1>
        <button className="btn btn-danger mt-3" onClick={() => signOut()}>Sign out</button>
      </div>
    )
  }

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <h1 className="mb-4">Sign In</h1>
      <button className="btn btn-primary mb-3" onClick={() => signIn()}>Sign in with your Google account</button>
      <a href="#" className="text-primary">Forgot your password?</a>
    </div>
  )
}
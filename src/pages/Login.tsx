// pages/login.tsx
import { useState, useEffect, useActionState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
      <h1 className="mb-4">{isRegistering ? 'Register' : 'Login'}</h1>
      <form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: '400px' }}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100 mb-3">
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      <button onClick={() => setIsRegistering(!isRegistering)} className="btn btn-link">
        {isRegistering ? 'Switch to Login' : 'Switch to Register'}
      </button>
    </div>
  );
}
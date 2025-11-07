/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you'd send this to a server for authentication.
    console.log('Logging in with:', { email, password });
    setEmail('');
    setPassword('');
    onLogin();
    navigate('/profile');
  };

  const handleGoogleLogin = () => {
    alert('Simulating Google login. In a real app, this would open the Google sign-in flow.');
    console.log('Attempting Google login...');
    onLogin();
    navigate('/profile');
  };

  const handleInstagramLogin = () => {
    alert('Simulating Instagram login. In a real app, this would redirect to Instagram.');
    console.log('Attempting Instagram login...');
    onLogin();
    navigate('/profile');
  };

  return (
    <main className="page-content">
      <div className="form-container" aria-labelledby="login-title">
        <h1 id="login-title">Login to VibeCast</h1>
        <p className="form-subtitle">
          Join the community to create your own rooms and save your favorites.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              aria-required="true"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              aria-required="true"
            />
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>

        <div className="divider">OR</div>

        <div className="social-login">
          <button type="button" className="btn btn-social btn-google" onClick={handleGoogleLogin}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path d="M1 1h22v22H1z" fill="none" /></svg>
            <span>Login with Google</span>
          </button>
          <button type="button" className="btn btn-social btn-instagram" onClick={handleInstagramLogin}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8A3.6 3.6 0 0 0 20 16.4V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg>
            <span>Login with Instagram</span>
          </button>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </main>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;

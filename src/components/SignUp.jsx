/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Signing up with:', { username, email, password });
        setUsername('');
        setEmail('');
        setPassword('');
        onLogin();
        navigate('/profile');
    };

    return (
        <main className="page-content">
            <div className="form-container" aria-labelledby="signup-title">
                <h1 id="signup-title">Create an Account</h1>
                 <p className="form-subtitle">
                    Join VibeCast to create rooms and watch with friends.
                </p>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="signup-email">Email Address</label>
                        <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="signup-password">Password</label>
                        <input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a strong password" required />
                    </div>
                    <button type="submit" className="btn btn-primary">Sign Up</button>
                </form>
                <p className="auth-switch">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </main>
    );
};

SignUp.propTypes = {
    onLogin: PropTypes.func.isRequired,
};

export default SignUp;

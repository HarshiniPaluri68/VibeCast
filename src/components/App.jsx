/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Explore from './Explore';
import Login from './Login';
import SignUp from './SignUp';
import Profile from './Profile';
import CreateRoomPage from './CreateRoomPage';
import WatchRoom from './WatchRoom';
import Friends from './Friends';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <div className="app-container">
        <header className="main-header">
          <Link to="/" className="logo">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="logo-icon"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9.5 16.5V7.5L16.5 12L9.5 16.5Z" fill="currentColor"/>
            </svg>
            <span className="logo-text">VibeCast</span>
          </Link>
          <nav className="main-nav">
            <Link to="/">Home</Link>
            <Link to="/explore">Explore</Link>
            {isLoggedIn ? (
              <>
                <Link to="/friends">Friends</Link>
                <Link to="/profile">Profile</Link>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup" className="btn-nav">Sign Up</Link>
              </>
            )}
          </nav>
        </header>
        <Routes>
            <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
            <Route path="/signup" element={<SignUp onLogin={() => setIsLoggedIn(true)} />} />
            <Route path="/profile" element={<Profile onLogout={() => setIsLoggedIn(false)} />} />
            <Route path="/create-room" element={<CreateRoomPage />} />
            <Route path="/room/:roomId" element={<WatchRoom />} />
            <Route path="/friends" element={<Friends />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const Profile = ({ onLogout }) => {
  const navigate = useNavigate();
  // We'll mock a username. In a real app, this would come from an auth context/state.
  const [username, setUsername] = useState('VibeCaster123');
  const [originalUsername, setOriginalUsername] = useState('VibeCaster123');
  const [isSaved, setIsSaved] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log('Saving username:', username);
    setOriginalUsername(username); // "Save" the username
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Hide message after 2 seconds
  };

  return (
    <main className="page-content">
      <div className="form-container">
        <h1 id="profile-title">My Profile</h1>
        <p className="form-subtitle">Manage your account settings and connect with friends.</p>
        <form onSubmit={handleSave} aria-labelledby="profile-title">
          <div className="form-group">
            <label htmlFor="profile-username">Username</label>
            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              aria-describedby={isSaved ? "save-confirm" : undefined}
            />
            {isSaved && <p id="save-confirm" style={{ color: 'var(--primary-accent-color)', marginTop: '0.5rem' }}>Username saved!</p>}
          </div>

          <div className="form-actions">
            <button onClick={handleLogout} type="button" className="btn btn-secondary">Logout</button>
            <button type="submit" className="btn btn-primary" disabled={username === originalUsername || !username.trim()}>Save Changes</button>
          </div>
        </form>
      </div>
    </main>
  );
};

Profile.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default Profile;

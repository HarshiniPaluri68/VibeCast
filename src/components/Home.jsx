/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';

// Mock data, can be replaced with a real API call
const allUsers = [
  { id: 1, username: 'Alice' },
  { id: 2, username: 'Bob' },
  { id: 3, username: 'Charlie' },
  { id: 4, username: 'Diana' },
];

const Home = ({ isLoggedIn }) => {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomId, setRoomId] = useState('');
  // Mock friend list for the logged-in user
  const [friends, setFriends] = useState([allUsers[0], allUsers[1], allUsers[2]]);
  const navigate = useNavigate();

  const handleJoinClick = () => {
    setShowJoinInput(true);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
      setRoomId('');
      setShowJoinInput(false);
    }
  };
  
  const handleInvite = (friendUsername) => {
    // In a real app, this would trigger an invitation flow (e.g., a notification or message)
    alert(`An invitation has been sent to ${friendUsername}!`);
  };

  const getUserColor = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 60%, 50%)`;
  };

  // Render the logged-in dashboard view
  if (isLoggedIn) {
    return (
      <main className="page-content">
        <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Welcome Back!</h1>
        <p className="hero-subtitle">
          Create a room and invite your friends for a watch party.
        </p>
        <div className="cta-buttons">
          <Link to="/create-room" className="btn btn-primary">Create Watch Room</Link>
          <button className="btn btn-secondary" onClick={handleJoinClick}>Join Room</button>
        </div>
        {showJoinInput && (
          <form onSubmit={handleJoinSubmit} className="join-room-form" aria-label="Join a room">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID or Link"
              className="join-input"
              aria-label="Room ID or Link"
              required
              autoFocus
            />
            <button type="submit" className="btn btn-primary">Join</button>
          </form>
        )}

        <div className="friends-dashboard">
          <h2>Friends Online</h2>
          {friends.length > 0 ? (
            <ul className="user-list">
              {friends.map(friend => (
                <li key={friend.id} className="user-list-item">
                   <div className="user-info">
                     <div className="message-avatar" style={{ backgroundColor: getUserColor(friend.username) }}>{friend.username.charAt(0)}</div>
                     <span>{friend.username}</span>
                   </div>
                   <button
                     className="btn btn-primary"
                     onClick={() => handleInvite(friend.username)}
                     style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                   >
                     Invite
                   </button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary-color)' }}>You haven't added any friends yet. Find some in the Friends tab!</p>
          )}
        </div>
      </main>
    );
  }

  // Render the default logged-out hero section
  return (
    <main className="hero-section">
      <h1 className="hero-title">Watch together Vibe together</h1>
      <p className="hero-subtitle">
        Stream your favorite movies, shows, and videos together in real-time.
        Connect with friends or discover new ones who share your taste.
      </p>
      <div className="cta-buttons">
        <Link to="/create-room" className="btn btn-primary">Create Watch Room</Link>
        <button className="btn btn-secondary" onClick={handleJoinClick}>Join Room</button>
      </div>
      {showJoinInput && (
        <form onSubmit={handleJoinSubmit} className="join-room-form" aria-label="Join a room">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID or Link"
            className="join-input"
            aria-label="Room ID or Link"
            required
            autoFocus
          />
          <button type="submit" className="btn btn-primary">Join</button>
        </form>
      )}
    </main>
  );
};

Home.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
};

export default Home;

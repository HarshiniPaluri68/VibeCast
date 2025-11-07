/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';

// Mock data for search results and friends list
const allUsers = [
  { id: 1, username: 'Alice' },
  { id: 2, username: 'Bob' },
  { id: 3, username: 'Charlie' },
  { id: 4, username: 'Diana' },
  { id: 5, username: 'VibeBot' },
  { id: 6, username: 'VibeCaster123' },
];

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([allUsers[0], allUsers[1]]); // Alice and Bob are friends
  const [sentRequests, setSentRequests] = useState([]); // Track sent friend requests by ID
  const [pendingRequests, setPendingRequests] = useState([allUsers[3]]); // Diana has sent you a request
  const [feedback, setFeedback] = useState({ type: '', userId: null });

  const showFeedback = (type, userId) => {
    setFeedback({ type, userId });
    setTimeout(() => {
        setFeedback({ type: '', userId: null });
    }, 2000); // Display feedback for 2 seconds
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    // In a real app, you wouldn't be able to search for yourself.
    const results = allUsers.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleSendRequest = (userToSend) => {
    if (!friends.some(friend => friend.id === userToSend.id) && !sentRequests.includes(userToSend.id)) {
      setSentRequests([...sentRequests, userToSend.id]);
      showFeedback('request_sent', userToSend.id);
    }
  };

  const handleAcceptRequest = (userToAccept) => {
    // Add to friends and remove from pending
    setFriends([...friends, userToAccept]);
    setPendingRequests(pendingRequests.filter(req => req.id !== userToAccept.id));
    showFeedback('friend_added', userToAccept.id);
  };
  
  const handleDeclineRequest = (userToDecline) => {
    // Just remove from pending
    setPendingRequests(pendingRequests.filter(req => req.id !== userToDecline.id));
  };
  
  const handleUnfriend = (userToUnfriend) => {
    if (window.confirm(`Are you sure you want to unfriend ${userToUnfriend.username}? This action cannot be undone.`)) {
      setFriends(friends.filter(friend => friend.id !== userToUnfriend.id));
    }
  };

  const isFriend = (userId) => friends.some(friend => friend.id === userId);
  const hasSentRequest = (userId) => sentRequests.includes(userId);

  const getUserColor = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 60%, 50%)`;
  };
  
  const getSearchResultButtonText = (user) => {
      if (isFriend(user.id)) return 'Friends';
      if (feedback.type === 'request_sent' && feedback.userId === user.id) return 'Request Sent!';
      if (hasSentRequest(user.id)) return 'Request Sent';
      return 'Add Friend';
  };

  return (
    <main className="page-content">
      <div className="form-container" style={{ maxWidth: '800px' }}>
        <h1>Connect with Friends</h1>
        <p className="form-subtitle">Find and add friends to share your vibes.</p>

        <form onSubmit={handleSearch} className="join-room-form" style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter a username to search"
            className="join-input"
            aria-label="Search for friends"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h2>Search Results</h2>
            <ul className="user-list">
              {searchResults.map(user => (
                <li key={user.id} className="user-list-item">
                  <div className="user-info">
                    <div className="message-avatar" style={{ backgroundColor: getUserColor(user.username) }}>{user.username.charAt(0)}</div>
                    <span>{user.username}</span>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSendRequest(user)}
                    disabled={isFriend(user.id) || hasSentRequest(user.id)}
                  >
                    {getSearchResultButtonText(user)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {searchResults.length > 0 && <div className="divider"></div>}

        {pendingRequests.length > 0 && (
           <div className="pending-requests">
             <h2>Pending Requests</h2>
             <ul className="user-list">
               {pendingRequests.map(request => (
                 <li key={request.id} className="user-list-item">
                    <div className="user-info">
                      <div className="message-avatar" style={{ backgroundColor: getUserColor(request.username) }}>{request.username.charAt(0)}</div>
                      <span>{request.username}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary" onClick={() => handleAcceptRequest(request)}>Accept</button>
                      <button className="btn btn-secondary" onClick={() => handleDeclineRequest(request)}>Decline</button>
                    </div>
                 </li>
               ))}
             </ul>
             <div className="divider"></div>
           </div>
        )}

        <div className="friends-list">
          <h2>Your Friends</h2>
          {friends.length > 0 ? (
            <ul className="user-list">
              {friends.map(friend => (
                <li key={friend.id} className="user-list-item">
                   <div className="user-info">
                     <div className="message-avatar" style={{ backgroundColor: getUserColor(friend.username) }}>{friend.username.charAt(0)}</div>
                     <span>{friend.username}</span>
                   </div>
                   <button
                     className="btn btn-danger"
                     onClick={() => handleUnfriend(friend)}
                   >
                     Unfriend
                   </button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary-color)' }}>You haven't added any friends yet.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Friends;
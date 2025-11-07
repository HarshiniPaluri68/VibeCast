/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import YouTube from 'react-youtube';
import '../styles/features.css';

// WebSocket service for real-time room communication
const roomService = {
  ws: null,
  listeners: new Set(),
  roomId: null,
  userId: null,
  username: null,

  connect(roomId, userId, username) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.roomId = roomId;
    this.userId = userId;
    this.username = username;

    // Replace with your actual WebSocket server URL
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
    this.ws = new WebSocket(`${wsUrl}/room/${roomId}?userId=${userId}&username=${encodeURIComponent(username)}`);

    this.ws.onopen = () => {
      console.log('Connected to room:', roomId);
      this.sendJoinRoom();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.listeners.forEach(listener => listener(message));
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from room');
      // Attempt reconnection after 3 seconds
      setTimeout(() => {
        if (this.roomId) {
          this.connect(this.roomId, this.userId, this.username);
        }
      }, 3000);
    };
  },

  disconnect() {
    if (this.ws) {
      this.sendLeaveRoom();
      this.ws.close();
      this.ws = null;
      this.roomId = null;
      this.userId = null;
      this.username = null;
    }
  },

  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  },

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  },

  sendJoinRoom() {
    this.send({
      type: 'join',
      userId: this.userId,
      username: this.username,
      timestamp: Date.now(),
    });
  },

  sendLeaveRoom() {
    this.send({
      type: 'leave',
      userId: this.userId,
      timestamp: Date.now(),
    });
  },

  sendChatMessage(text) {
    this.send({
      type: 'chat',
      userId: this.userId,
      username: this.username,
      text,
      timestamp: Date.now(),
    });
  },

  sendPlaybackAction(action) {
    this.send({
      type: 'playback',
      userId: this.userId,
      action,
      timestamp: Date.now(),
    });
  },

  sendParticipantState(state) {
    this.send({
      type: 'participant_state',
      userId: this.userId,
      state,
      timestamp: Date.now(),
    });
  },

  sendVideoChange(videoId) {
    this.send({
      type: 'video_change',
      userId: this.userId,
      username: this.username,
      videoId,
      timestamp: Date.now(),
    });
  },

  sendReaction(emoji) {
    this.send({
      type: 'reaction',
      userId: this.userId,
      username: this.username,
      emoji,
      timestamp: Date.now(),
    });
  },
};


const WatchRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const { roomTitle, roomType } = location.state || { 
    roomTitle: roomId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), 
    roomType: 'public' 
  };

  // Generate unique user ID (you can replace with actual auth user ID)
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [username] = useState(() => {
    // Get username from localStorage, location state, or generate one
    return localStorage.getItem('username') || 
           location.state?.username || 
           `User${Math.floor(Math.random() * 1000)}`;
  });

  const [messages, setMessages] = useState([
    { id: 1, userId: 'bot', username: 'VibeBot', text: `Welcome to the room! Share a video to get started.` },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [videoId, setVideoId] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [recognition, setRecognition] = useState(null);

  const playerRef = useRef(null);
  const isLocalAction = useRef(true);
  const messagesEndRef = useRef(null);
  const voiceTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const localVideoRef = useRef(null);
  const reactionIdCounter = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  // Connect to WebSocket on mount
  useEffect(() => {
    roomService.connect(roomId, userId, username);

    return () => {
      roomService.disconnect();
    };
  }, [roomId, userId, username]);
  
  // Effect for handling all real-time events from WebSocket
  useEffect(() => {
    const handleRoomEvent = (event) => {
      switch (event.type) {
        case 'chat':
          // Don't duplicate our own messages
          if (event.userId !== userId) {
            setMessages((prevMessages) => [...prevMessages, {
              id: event.timestamp || Date.now(),
              userId: event.userId,
              username: event.username,
              text: event.text,
            }]);
          }
          break;

        case 'join':
          if (event.userId !== userId) {
            // Add new participant
            setParticipants((prevParticipants) => {
              const exists = prevParticipants.some(p => p.id === event.userId);
              if (!exists) {
                return [...prevParticipants, {
                  id: event.userId,
                  name: event.username,
                  isCameraOn: true,
                  isMicMuted: false,
                  isHandRaised: false,
                }];
              }
              return prevParticipants;
            });

            // Add system message
            setMessages((prevMessages) => [...prevMessages, {
              id: Date.now(),
              userId: 'system',
              username: 'System',
              text: `${event.username} joined the room`,
            }]);
          }
          break;

        case 'leave':
          if (event.userId !== userId) {
            setParticipants((prevParticipants) => {
              const participant = prevParticipants.find(p => p.id === event.userId);
              if (participant) {
                setMessages((prevMessages) => [...prevMessages, {
                  id: Date.now(),
                  userId: 'system',
                  username: 'System',
                  text: `${participant.name} left the room`,
                }]);
              }
              return prevParticipants.filter(p => p.id !== event.userId);
            });
          }
          break;

        case 'participant_state':
          if (event.userId !== userId) {
            setParticipants((prevParticipants) =>
              prevParticipants.map(p =>
                p.id === event.userId ? { ...p, ...event.state } : p
              )
            );
          }
          break;

        case 'playback':
          if (event.userId !== userId && playerRef.current) {
            isLocalAction.current = false;
            const player = playerRef.current;
            const { command, time } = event.action;
            const currentTime = player.getCurrentTime();

            switch (command) {
              case 'PLAY':
                if (Math.abs(currentTime - time) > 1.5) {
                  player.seekTo(time, true);
                }
                player.playVideo();
                break;
              case 'PAUSE':
                player.pauseVideo();
                if (Math.abs(currentTime - time) > 1.5) {
                  player.seekTo(time, true);
                }
                break;
            }
          }
          break;

        case 'video_change':
          if (event.userId !== userId) {
            setVideoId(event.videoId);
            setMessages((prevMessages) => [...prevMessages, {
              id: Date.now(),
              userId: 'system',
              username: 'System',
              text: `${event.username} changed the video`,
            }]);
          }
          break;

        case 'room_state':
          // Initial room state when joining
          if (event.participants) {
            setParticipants(event.participants.filter(p => p.id !== userId));
          }
          if (event.currentVideo) {
            setVideoId(event.currentVideo);
          }
          if (event.messages) {
            setMessages(event.messages);
          }
          break;

        case 'reaction':
          // Show floating reaction animation
          const reactionId = `reaction-${Date.now()}-${Math.random()}`;
          setReactions((prev) => [...prev, {
            id: reactionId,
            emoji: event.emoji,
            username: event.username,
            timestamp: event.timestamp,
          }]);
          
          // Remove reaction after animation completes (3 seconds)
          setTimeout(() => {
            setReactions((prev) => prev.filter(r => r.id !== reactionId));
          }, 3000);
          break;

        default:
          console.log('Unknown event type:', event.type);
      }
    };
    const unsubscribe = roomService.subscribe(handleRoomEvent);
    return () => unsubscribe();
  }, [roomId, userId, username]);

  // Effect to close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        if (!event.target.closest('.emoji-toggle-btn')) {
          setShowEmojiPicker(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect to get user media for video chat
  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        alert("VibeCast needs access to your camera and microphone for video chat. Please grant permission and refresh.");
      }
    };

    startMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Effect to initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const getYoutubeVideoId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return url.match(regex)?.[1] || null;
  };

  const handleShareVideo = (e) => {
    e.preventDefault();
    const newVideoId = getYoutubeVideoId(urlInput);
    if (newVideoId) {
      setVideoId(newVideoId);
      roomService.sendVideoChange(newVideoId);
      setUrlInput('');
    } else {
      alert('Invalid YouTube URL. Please try again.');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageData = {
        id: Date.now(),
        userId,
        username,
        text: newMessage.trim(),
      };
      // Add to local messages immediately for better UX
      setMessages((prevMessages) => [...prevMessages, messageData]);
      // Send to server
      roomService.sendChatMessage(newMessage.trim());
      setNewMessage('');
    }
  };
  
  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleQuickReaction = (emoji) => {
    // Send reaction that appears as floating animation
    roomService.sendReaction(emoji);
  };

  const handleVoiceInputToggle = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
  };

  const onPlayerStateChange = (event) => {
    if (!isLocalAction.current) {
      isLocalAction.current = true; // Reset flag after programmatic change is complete
      return;
    }

    const state = event.data;
    const player = playerRef.current;

    if (state === 1 /* PLAYING */) {
      roomService.sendPlaybackAction({
        command: 'PLAY',
        time: player.getCurrentTime(),
      });
    } else if (state === 2 /* PAUSED */) {
      roomService.sendPlaybackAction({
        command: 'PAUSE',
        time: player.getCurrentTime(),
      });
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const newState = videoTrack.enabled;
        setIsCameraOn(newState);
        roomService.sendParticipantState({ isCameraOn: newState });
      }
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newState = !audioTrack.enabled;
        setIsMicMuted(newState);
        roomService.sendParticipantState({ isMicMuted: newState });
      }
    }
  };
  
  const toggleHandRaise = () => {
    setIsHandRaised(prev => {
      const newState = !prev;
      roomService.sendParticipantState({ isHandRaised: newState });
      return newState;
    });
  };

  // Remove this function - remote participant states are controlled by their own clients

  const getUserColor = (displayUsername) => {
    if (displayUsername === username) return 'var(--primary-accent-color)';
    if (displayUsername === 'VibeBot' || displayUsername === 'System') return '#6c757d';
    let hash = 0;
    for (let i = 0; i < displayUsername.length; i++) {
      hash = displayUsername.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 60%, 50%)`;
  };

  return (
    <main className="watch-room-container">
      <div className="video-player-container">
        <div className="watch-room-header">
            <h2 className="room-main-title">{roomTitle}</h2>
            <span className={`room-type-badge ${roomType}`}>{roomType}</span>
        </div>

        {videoId ? (
          <div className="video-embed-container">
            <YouTube
              videoId={videoId}
              opts={{
                height: '100%',
                width: '100%',
                playerVars: {
                  autoplay: 1,
                  controls: 1, // Show native controls to the host
                },
              }}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          </div>
        ) : (
          <div className="video-placeholder">
            <h2 className="video-title">Let's Get a Vibe Going!</h2>
            <p>Share a YouTube video below to start the party.</p>
          </div>
        )}
        <form onSubmit={handleShareVideo} className="share-video-form" aria-label="Share a video">
            <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Paste a YouTube URL to share" className="join-input" required />
            <button type="submit" className="btn btn-primary">{videoId ? 'Change Video' : 'Share Video'}</button>
        </form>
        
        {/* Quick Reactions Bar */}
        <div className="quick-reactions-bar">
          <button type="button" onClick={() => handleQuickReaction('👍')} className="reaction-btn" aria-label="Thumbs up">👍</button>
          <button type="button" onClick={() => handleQuickReaction('❤️')} className="reaction-btn" aria-label="Heart">❤️</button>
          <button type="button" onClick={() => handleQuickReaction('😂')} className="reaction-btn" aria-label="Laughing">😂</button>
          <button type="button" onClick={() => handleQuickReaction('🔥')} className="reaction-btn" aria-label="Fire">🔥</button>
          <button type="button" onClick={() => handleQuickReaction('🎉')} className="reaction-btn" aria-label="Party">🎉</button>
          <button type="button" onClick={() => handleQuickReaction('😮')} className="reaction-btn" aria-label="Surprised">😮</button>
          <button type="button" onClick={() => handleQuickReaction('👏')} className="reaction-btn" aria-label="Clapping">👏</button>
        </div>
        
        {/* Floating Reactions */}
        <div className="floating-reactions-container">
          {reactions.map((reaction) => (
            <div key={reaction.id} className="floating-reaction" style={{ left: `${Math.random() * 80 + 10}%` }}>
              <span className="reaction-emoji">{reaction.emoji}</span>
            </div>
          ))}
        </div>
        <div className="participants-grid">
          <div className="participant-video-wrapper local-user">
            <video ref={localVideoRef} className="participant-video" autoPlay playsInline muted style={{ opacity: isCameraOn ? 1 : 0 }}/>
            {!isCameraOn && (
              <div className="camera-off-indicator">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l22 22"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"/></svg>
              </div>
            )}
            {isHandRaised && (
              <div className="raised-hand-indicator" aria-label="Hand raised">
                <span>✋</span>
              </div>
            )}
            <div className="participant-overlay-controls">
                <div 
                    className={`status-icon ${isMicMuted ? 'off' : ''}`} 
                    onClick={toggleMic}
                    aria-label={isMicMuted ? 'Unmute' : 'Mute'}
                    role="button"
                    tabIndex={0}
                >
                  {isMicMuted ? 
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06 0-.11 0-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.55-.9L19.73 21 21 19.73 4.27 3z"/></svg>
                    : 
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>
                  }
                </div>
                 <div 
                    className={`status-icon ${!isCameraOn ? 'off' : ''}`} 
                    onClick={toggleCamera}
                    aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                    role="button"
                    tabIndex={0}
                 >
                   {!isCameraOn ? 
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M1 22.72 2.28 24l.72-2.16L1 22.72zm21.72-20.44L3.28 2.28 1 3.56l2 2V17c0 .55.45 1 1 1h12c.34 0 .65-.17.83-.42L19.44 20 21 18.44l-2-2-1.28-1.28L1 2.28zm-3.28 9.16L17 10.5V7c0-.55-.45-1-1-1H7.56l2 2H15v3.44l2 2v-3.5l4 4v-11l-4 4v-1.08z"/></svg>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                   }
                 </div>
            </div>
            <span className="participant-name">{username} (You)</span>
            <div className="video-controls">
              <button onClick={toggleMic} className={`video-control-btn ${isMicMuted ? 'off' : ''}`} aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}>
                {isMicMuted ? 
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06 0-.11 0-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.55-.9L19.73 21 21 19.73 4.27 3z"/></svg>
                  : 
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>
                }
              </button>
              <button onClick={toggleCamera} className={`video-control-btn ${!isCameraOn ? 'off' : ''}`} aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}>
                {isCameraOn ? 
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                  :
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M1 22.72 2.28 24l.72-2.16L1 22.72zm21.72-20.44L3.28 2.28 1 3.56l2 2V17c0 .55.45 1 1 1h12c.34 0 .65-.17.83-.42L19.44 20 21 18.44l-2-2-1.28-1.28L1 2.28zm-3.28 9.16L17 10.5V7c0-.55-.45-1-1-1H7.56l2 2H15v3.44l2 2v-3.5l4 4v-11l-4 4v-1.08z"/></svg>
                }
              </button>
              <button onClick={toggleHandRaise} className={`video-control-btn ${isHandRaised ? 'active' : ''}`} aria-label={isHandRaised ? 'Lower hand' : 'Raise hand'}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M10 20.5c.55 0 1-.45 1-1V15h1v4.5c0 .55.45 1 1 1s1-.45 1-1V15h1v4.5c0 .55.45 1 1 1s1-.45 1-1V14c0-1.1-.9-2-2-2h-1.17c1.25-1.25 1.17-3.08-.17-4.17C14.66 6.84 12.83 7 11.83 8H12c1.1 0 2-.9 2-2V3.5c0-.83-.67-1.5-1.5-1.5S11 2.67 11 3.5V6H9.5C8.67 6 8 6.67 8 7.5V11H7V7.5C7 6.67 6.33 6 5.5 6S4 6.67 4 7.5V13c0 1.1.9 2 2 2h2.5v4.5c0 .55.45 1 1 1z"/></svg>
              </button>
            </div>
          </div>
          {participants.map((p) => (
             <div key={p.id} className="participant-video-wrapper">
              {p.isCameraOn ? (
                 <div className="participant-video-placeholder" style={{ backgroundColor: getUserColor(p.name) }}>
                    <span>{p.name.charAt(0)}</span>
                 </div>
              ) : (
                <div className="camera-off-indicator" style={{ position: 'static' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l22 22"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"/></svg>
                </div>
              )}
              {p.isHandRaised && (
                <div className="raised-hand-indicator" aria-label={`${p.name} has hand raised`}>
                  <span>✋</span>
                </div>
              )}
               <div className="participant-overlay-controls">
                 <div 
                    className={`status-icon ${p.isMicMuted ? 'off' : ''}`} 
                    aria-label={p.isMicMuted ? `${p.name} is muted` : `${p.name} is unmuted`}
                 >
                  {p.isMicMuted ? 
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06 0-.11 0-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.55-.9L19.73 21 21 19.73 4.27 3z"/></svg>
                    : 
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg>
                  }
                 </div>
                 <div 
                    className={`status-icon ${!p.isCameraOn ? 'off' : ''}`} 
                    aria-label={p.isCameraOn ? `${p.name}'s camera is on` : `${p.name}'s camera is off`}
                 >
                   {!p.isCameraOn ? 
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M1 22.72 2.28 24l.72-2.16L1 22.72zm21.72-20.44L3.28 2.28 1 3.56l2 2V17c0 .55.45 1 1 1h12c.34 0 .65-.17.83-.42L19.44 20 21 18.44l-2-2-1.28-1.28L1 2.28zm-3.28 9.16L17 10.5V7c0-.55-.45-1-1-1H7.56l2 2H15v3.44l2 2v-3.5l4 4v-11l-4 4v-1.08z"/></svg>
                     :
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                   }
                 </div>
              </div>
              <span className="participant-name">{p.name}</span>
             </div>
          ))}
        </div>
      </div>
      <aside className="chat-sidebar">
        <h3 className="chat-header">Live Chat</h3>
        <div className="messages-container" aria-live="polite">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.userId === userId ? 'own-message' : ''} ${msg.userId === 'system' ? 'system-message' : ''}`}>
              <div className="message-avatar" style={{ backgroundColor: getUserColor(msg.username) }}>
                {msg.username.charAt(0)}
              </div>
              <div className="message-content">
                <span className="message-sender">{msg.userId === userId ? 'You' : msg.username}</span>
                <p className="message-text">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="chat-input-form" aria-label="Send a chat message">
          {showEmojiPicker && (
            <div className="emoji-picker" ref={emojiPickerRef}>
              <button type="button" onClick={() => handleEmojiSelect('😂')}>😂</button>
              <button type="button" onClick={() => handleEmojiSelect('❤️')}>❤️</button>
              <button type="button" onClick={() => handleEmojiSelect('🔥')}>🔥</button>
              <button type="button" onClick={() => handleEmojiSelect('😍')}>😍</button>
              <button type="button" onClick={() => handleEmojiSelect('🤯')}>🤯</button>
              <button type="button" onClick={() => handleEmojiSelect('👍')}>👍</button>
              <button type="button" onClick={() => handleEmojiSelect('👎')}>👎</button>
              <button type="button" onClick={() => handleEmojiSelect('😊')}>😊</button>
              <button type="button" onClick={() => handleEmojiSelect('😢')}>😢</button>
              <button type="button" onClick={() => handleEmojiSelect('😮')}>😮</button>
              <button type="button" onClick={() => handleEmojiSelect('🎉')}>🎉</button>
              <button type="button" onClick={() => handleEmojiSelect('👏')}>👏</button>
              <button type="button" onClick={() => handleEmojiSelect('🙌')}>🙌</button>
              <button type="button" onClick={() => handleEmojiSelect('💯')}>💯</button>
              <button type="button" onClick={() => handleEmojiSelect('⭐')}>⭐</button>
            </div>
          )}
          <button type="button" className="chat-action-btn emoji-toggle-btn" onClick={() => setShowEmojiPicker(prev => !prev)} aria-label="Select emoji">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/><path d="M14.5 10.5c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm-5 0c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5z"/><path d="M12 16.5c-2.339 0-4.45-1.049-5.836-2.733l1.672-1.037c.923.974 2.213 1.57 3.664 1.57s2.741-.596 3.664-1.57l1.672 1.037C16.45 15.451 14.339 16.5 12 16.5z"/></svg>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Say something..."
            className="chat-input"
            aria-label="Chat message"
          />
          <button type="button" className={`chat-action-btn voice-btn ${isListening ? 'listening' : ''}`} onClick={handleVoiceInputToggle} aria-label={isListening ? 'Stop recording' : 'Start recording'}>
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.654 0 3-1.346 3-3V5c0-1.654-1.346-3-3-3S9 3.346 9 5v6c0 1.654 1.346 3 3 3zM19 11h-2c0 3.309-2.691 6-6 6s-6-2.691-6-6H3c0 4.072 3.061 7.436 7 7.931V22h2v-3.069c3.939-.495 7-3.859 7-7.931z"/></svg>
          </button>
          <button type="submit" className="btn btn-primary send-btn" aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </form>
      </aside>
    </main>
  );
};

export default WatchRoom;
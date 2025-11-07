# VibeCast - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Backend (WebSocket Server)
```bash
cd server
npm install    # Only needed first time
npm start
```
✅ Server runs on: **ws://localhost:8080**

### 2. Start the Frontend (React App)
```bash
# In a new terminal, from project root
npm run dev
```
✅ App opens at: **http://localhost:5173/**

---

## 🎬 Create & Join a Room

### Create a Room:
1. Click **"Create Watch Room"** button
2. Enter a title (e.g., "Movie Night")
3. Add description
4. Choose **Public** or **Private**
5. Click **"Create Room"**

### Join a Room:
1. Click **"Join Room"** button
2. Enter room ID or paste room URL
3. Click **"Join"**

---

## 🎥 Playing Videos

### Share a YouTube Video:
1. Go to YouTube and copy any video URL
   - Example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. Paste URL in the "Paste a YouTube URL to share" input
3. Click **"Share Video"** or **"Change Video"**
4. Video loads and plays for everyone! 🎉

### Change Videos:
- Paste a new YouTube URL anytime
- Click "Change Video"
- Everyone sees the new video automatically

---

## 💬 Using Chat Features

### Send Messages:
1. Type in the chat input box
2. Press Enter or click Send button (✈️)
3. Message appears instantly for all users

### Add Emojis:
1. Click the emoji button (😊)
2. Select an emoji: 😂 ❤️ 🔥 🤯 👍
3. Emoji adds to your message
4. Or just paste any emoji directly!

### Voice Input (Simulated):
1. Click microphone button 🎤
2. Wait 3 seconds (currently simulated)
3. Demo message auto-sends

---

## 📹 Video Chat Controls

### Enable Your Camera:
1. Browser will ask for camera/mic permissions
2. Click **"Allow"**
3. Your video appears in participant grid

### Control Your Video:
- **Camera button**: Turn camera on/off
- **Mic button**: Mute/unmute audio
- **Hand button**: Raise/lower hand (✋)

### Where to Find Controls:
- On your video thumbnail (overlay icons)
- Below your video (larger buttons)

---

## 🧪 Test All Features

### Open Multiple Tabs:
1. Open 2-3 browser tabs
2. Join the same room in each tab
3. Different usernames auto-generated

### Test Real-Time Sync:
- ✅ Send chat from Tab 1 → appears in Tab 2 & 3
- ✅ Change video in Tab 2 → everyone sees it
- ✅ Pause video in Tab 3 → all videos pause
- ✅ Toggle camera in Tab 1 → others see status update

---

## 📺 Example YouTube Videos to Test

Copy these URLs to test:

**Music Videos:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://www.youtube.com/watch?v=9bZkp7q19f0
```

**Short Videos:**
```
https://www.youtube.com/watch?v=jNQXAC9IVRw
https://www.youtube.com/watch?v=hY7m5jjJ9mM
```

**Live Streams** (if available):
```
https://www.youtube.com/watch?v=[any-live-stream-id]
```

---

## ✅ Features Checklist

Test these while watching:

- [ ] Share a YouTube video
- [ ] Change to a different video
- [ ] Send chat messages
- [ ] Add emojis to messages
- [ ] Toggle camera on/off
- [ ] Toggle mic mute/unmute
- [ ] Raise/lower hand
- [ ] Pause/play video (syncs for all)
- [ ] Join from multiple tabs
- [ ] See participants join/leave

---

## 🔧 Troubleshooting

### Video Won't Load?
- Check if URL is a valid YouTube link
- Try a different video
- Check browser console for errors

### Camera Not Working?
- Grant browser permissions
- Check if camera is used by another app
- Try refreshing the page

### Chat Not Syncing?
- Make sure WebSocket server is running
- Check server terminal for connection logs
- Verify you're on the same room ID

### Others Can't See My Video?
- This is expected! Currently shows local video only
- For peer-to-peer video, WebRTC integration needed
- Camera states (on/off) DO sync to others

---

## 🎯 Quick Command Reference

```bash
# Start everything
cd server && npm start              # Terminal 1
cd .. && npm run dev                # Terminal 2

# Stop servers
Ctrl + C                            # In each terminal

# Install dependencies (if needed)
npm install                         # In root directory
cd server && npm install            # In server directory
```

---

## 🎉 You're Ready!

**Everything you requested is working:**
- ✅ Multiple video playback (YouTube)
- ✅ Change videos anytime
- ✅ Chat while watching
- ✅ Emoji reactions
- ✅ Voice input (simulated)
- ✅ Video chat (local feed + state sync)
- ✅ Camera/mic controls
- ✅ Hand raise
- ✅ Works in both public & private rooms

**Have fun watching together! 🍿🎬**

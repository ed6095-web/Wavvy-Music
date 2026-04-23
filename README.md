# 🎵 Wavvy — Premium Music Streaming App

A modern, full-stack music streaming web application built with React + Node.js, powered by YouTube Music data.

---

## 🏗️ Project Structure

```
music-app/
├── backend/       → Node.js + Express API
└── frontend/      → React + Vite Web App
```

---

## ⚙️ Setup & Running

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev        # runs on http://localhost:3001
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:5173
```

### 3. Open the App
Visit: **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=query` | Search songs |
| GET | `/api/trending` | Get trending songs |
| GET | `/api/recommended` | Get recommended songs |
| GET | `/api/moods` | Get mood playlists |
| GET | `/api/song/info/:videoId` | Get song metadata |
| GET | `/api/song/stream/:videoId` | Stream audio |
| GET | `/health` | Health check |

---

## 📱 Android WebView

1. Build the frontend: `npm run build` (in `/frontend`)
2. Host on Vercel / Netlify (free)
3. In Android Studio:
   - Create new project → **Empty Activity**
   - Add `WebView` to layout XML
   - In `MainActivity.kt`:
     ```kotlin
     val webView = findViewById<WebView>(R.id.webView)
     webView.settings.javaScriptEnabled = true
     webView.loadUrl("https://your-vercel-url.vercel.app")
     ```
   - Add internet permission to `AndroidManifest.xml`:
     ```xml
     <uses-permission android:name="android.permission.INTERNET" />
     ```

---

## 🎨 Tech Stack

- **Frontend**: React 19, Vite, React Router 6, Vanilla CSS
- **Backend**: Node.js, Express, youtube-sr, @distube/ytdl-core
- **Design**: Dark mode, Glassmorphism, Purple→Pink→Red gradient

---

## ✨ Features

- 🔍 Song search via YouTube
- ▶️ Audio streaming (proxied through backend)
- 🔥 Trending, Recommended, Mood playlists
- 🕐 Recently played tracking (localStorage)
- ♥ Like/unlike songs (localStorage)
- 🔀 Shuffle & Repeat
- 📱 Fully responsive (mobile bottom nav)
- 🎨 Premium dark UI with glassmorphism

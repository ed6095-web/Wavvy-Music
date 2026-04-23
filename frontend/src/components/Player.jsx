import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import '../styles/player.css';

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Player() {
  const {
    currentSong, isPlaying, currentTime, duration,
    volume, isLoading, shuffle, repeat,
    togglePlay, handleNext, handlePrev, seek,
    setVolume, toggleLike, isLiked,
    setShuffle, setRepeat,
  } = usePlayer();

  const [volVisible, setVolVisible] = useState(false);
  const liked = currentSong ? isLiked(currentSong.id) : false;
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  const cycleRepeat = () => setRepeat(r => !r);

  return (
    <div className="player-bar">
      {/* Left: Song info */}
      <div className="player-info">
        {currentSong ? (
          <>
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="player-thumb"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div className="player-meta">
              <p className="player-title">{currentSong.title}</p>
              <p className="player-artist">{currentSong.artist}</p>
            </div>
            <button
              className={`player-like-btn ${liked ? 'liked' : ''}`}
              onClick={() => toggleLike(currentSong)}
              title={liked ? 'Unlike' : 'Like'}
            >
              {liked ? '♥' : '♡'}
            </button>
          </>
        ) : (
          <>
            <div className="player-thumb-placeholder">🎵</div>
            <div className="player-meta">
              <p className="player-title" style={{ color: 'var(--text-muted)' }}>No song playing</p>
              <p className="player-artist">Search & play something</p>
            </div>
          </>
        )}
      </div>

      {/* Mobile-only: compact play + next controls */}
      <div className="player-mobile-controls">
        <button className="play-btn" onClick={togglePlay} disabled={!currentSong}>
          {isLoading ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
            </svg>
          ) : isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
        <button className="ctrl-btn" onClick={handleNext}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>

      {/* Desktop: Center controls + progress */}
      <div className="player-controls">
        <div className="player-btns">
          <button
            className={`ctrl-btn ${shuffle ? 'active-ctrl' : ''}`}
            onClick={() => setShuffle(s => !s)}
            title="Shuffle"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
            </svg>
          </button>

          <button className="ctrl-btn" onClick={handlePrev} title="Previous">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
            </svg>
          </button>

          <button className="play-btn" onClick={togglePlay} disabled={!currentSong} title={isPlaying ? 'Pause' : 'Play'}>
            {isLoading ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
              </svg>
            ) : isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button className="ctrl-btn" onClick={handleNext} title="Next">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>

          <button
            className={`ctrl-btn ${repeat ? 'active-ctrl' : ''}`}
            onClick={cycleRepeat}
            title="Repeat"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="player-progress">
          <span className="progress-time">{formatTime(currentTime)}</span>
          <div className="progress-track" onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-time right">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="player-right">
        <button
          className="ctrl-btn"
          onClick={() => setVolVisible(v => !v)}
          title="Volume"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            {volume === 0
              ? <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/>
              : <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            }
          </svg>
        </button>
        <input
          type="range" min="0" max="1" step="0.01"
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="volume-slider"
          title="Volume"
        />
      </div>
    </div>
  );
}

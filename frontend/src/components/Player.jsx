import React, { useState, useRef } from 'react';
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
    volume, isLoading, shuffle, repeat, queue,
    togglePlay, handleNext, handlePrev, seek, playSong,
    setVolume, toggleLike, isLiked,
    setShuffle, setRepeat,
  } = usePlayer();

  const [expanded, setExpanded] = useState(false);
  const touchStartY = useRef(null);
  
  const liked = currentSong ? isLiked(currentSong.id) : false;
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  const handleProgressTouch = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const ratio = (touch.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(1, ratio)) * duration);
  };

  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEndFullscreen = (e) => {
    if (!touchStartY.current) return;
    const touchEndY = e.changedTouches[0].clientY;
    if (touchEndY - touchStartY.current > 60) {
      setExpanded(false); // Swiped down
    }
    touchStartY.current = null;
  };

  const onTouchEndMini = (e) => {
    if (!touchStartY.current) return;
    const touchEndY = e.changedTouches[0].clientY;
    if (touchStartY.current - touchEndY > 30) {
      setExpanded(true); // Swiped up
    }
    touchStartY.current = null;
  };

  // ── Full-screen expanded player (like YT Music) ──
  if (expanded && currentSong) {
    return (
      <div 
        className="player-fullscreen"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEndFullscreen}
      >
        {/* Top bar */}
        <div className="pf-topbar">
          <button className="pf-down-btn" onClick={() => setExpanded(false)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </button>
          <p className="pf-queue-label">Now Playing</p>
          <div style={{ width: 40 }} />
        </div>

        <div className="pf-scroll-content">
          {/* Album art */}
          <div className="pf-art-wrap">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="pf-art"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Song info + like */}
          <div className="pf-info-row">
            <div className="pf-info">
              <p className="pf-title">{currentSong.title}</p>
              <p className="pf-artist">{currentSong.artist}</p>
            </div>
            <button
              className={`pf-like-btn ${liked ? 'liked' : ''}`}
              onClick={() => toggleLike(currentSong)}
            >
              {liked ? '♥' : '♡'}
            </button>
          </div>

          {/* Progress bar */}
          <div className="pf-progress-section">
            <div
              className="pf-progress-track"
              onClick={handleProgressClick}
              onTouchMove={handleProgressTouch}
            >
              <div className="pf-progress-fill" style={{ width: `${progress}%` }}>
                <div className="pf-progress-thumb" />
              </div>
            </div>
            <div className="pf-time-row">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="pf-controls">
            <button
              className={`pf-ctrl-btn ${shuffle ? 'pf-active' : ''}`}
              onClick={() => setShuffle(s => !s)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
              </svg>
            </button>

            <button className="pf-ctrl-btn pf-prev" onClick={handlePrev}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
              </svg>
            </button>

            <button className="pf-play-btn" onClick={togglePlay}>
              {isLoading ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                </svg>
              ) : isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button className="pf-ctrl-btn pf-next" onClick={handleNext}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>

            <button
              className={`pf-ctrl-btn ${repeat ? 'pf-active' : ''}`}
              onClick={() => setRepeat(r => !r)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              </svg>
            </button>
          </div>

          {/* Volume */}
          <div className="pf-volume">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ color: 'var(--text-muted)' }}>
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <input
              type="range" min="0" max="1" step="0.01"
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="pf-volume-slider"
            />
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ color: 'var(--text-muted)' }}>
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </div>

          {/* Nxt Wave Queue */}
          <div className="nxt-wave-section">
            <h3 className="nxt-wave-title">Nxt Wave</h3>
            <div className="nxt-wave-list">
              {queue && queue.length > 0 ? (
                queue.slice(0, 10).map((song, idx) => (
                  <div key={idx} className="nxt-wave-item" onClick={() => playSong(song, queue)}>
                    <img src={song.thumbnail} alt={song.title} className="nxt-wave-thumb" />
                    <div className="nxt-wave-info">
                      <p className="nxt-wave-song-title">{song.title}</p>
                      <p className="nxt-wave-song-artist">{song.artist}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="nxt-wave-empty">Related songs will appear here.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Mini player bar ──
  return (
    <div 
      className="player-bar" 
      onClick={() => currentSong && setExpanded(true)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEndMini}
    >
      {/* Song info */}
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
              onClick={e => { e.stopPropagation(); toggleLike(currentSong); }}
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
      <div className="player-mobile-controls" onClick={e => e.stopPropagation()}>
        <button className="play-btn" onClick={e => { e.stopPropagation(); togglePlay(); }} disabled={!currentSong}>
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
        <button className="ctrl-btn" onClick={e => { e.stopPropagation(); handleNext(); }}>
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
            onClick={e => { e.stopPropagation(); setShuffle(s => !s); }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
            </svg>
          </button>
          <button className="ctrl-btn" onClick={e => { e.stopPropagation(); handlePrev(); }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
            </svg>
          </button>
          <button className="play-btn" onClick={e => { e.stopPropagation(); togglePlay(); }} disabled={!currentSong}>
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
          <button className="ctrl-btn" onClick={e => { e.stopPropagation(); handleNext(); }}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
          <button
            className={`ctrl-btn ${repeat ? 'active-ctrl' : ''}`}
            onClick={e => { e.stopPropagation(); setRepeat(r => !r); }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            </svg>
          </button>
        </div>
        <div className="player-progress" onClick={e => e.stopPropagation()}>
          <span className="progress-time">{formatTime(currentTime)}</span>
          <div className="progress-track" onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-time right">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Desktop Right: Volume */}
      <div className="player-right" onClick={e => e.stopPropagation()}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ color: 'var(--text-muted)' }}>
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        <input
          type="range" min="0" max="1" step="0.01"
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="volume-slider"
        />
      </div>
    </div>
  );
}

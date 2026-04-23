import React from 'react';
import SongCard from '../components/SongCard';
import { usePlayer } from '../context/PlayerContext';
import './Library.css'; // Reusing Library styles

export default function Offline() {
  const { offlineSongs } = usePlayer();

  return (
    <div className="library-page">
      <div className="library-header">
        <h1 className="library-title gradient-text">Available Offline</h1>
      </div>

      <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{ color: 'var(--accent-green, #4caf50)' }}>
             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          These songs are automatically saved here because you've listened to them 5 or more times.
        </p>
      </div>

      {offlineSongs.length === 0 ? (
        <div className="library-empty">
          <div className="library-empty-icon">☁️</div>
          <p className="library-empty-title">No offline songs yet</p>
          <p className="library-empty-sub">
            Listen to any song 5 times and it will be automatically added here!
          </p>
          <a href="/" className="btn-gradient" style={{ display: 'inline-block', marginTop: 20, textDecoration: 'none' }}>
            Go Home
          </a>
        </div>
      ) : (
        <div className="library-grid">
          {offlineSongs.map(song => (
            <SongCard key={song.id} song={song} queue={offlineSongs} />
          ))}
        </div>
      )}
    </div>
  );
}

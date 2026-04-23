import React, { useState } from 'react';
import SongCard from '../components/SongCard';
import { usePlayer } from '../context/PlayerContext';
import './Library.css';

export default function Library() {
  const { liked, recentlyPlayed } = usePlayer();
  const [tab, setTab] = useState('liked');

  const songs = tab === 'liked' ? liked : recentlyPlayed;

  return (
    <div className="library-page">
      <div className="library-header">
        <h1 className="library-title gradient-text">Your Library</h1>
        <div className="library-tabs">
          <button
            className={`lib-tab ${tab === 'liked' ? 'active' : ''}`}
            onClick={() => setTab('liked')}
          >
            ♥ Liked Songs ({liked.length})
          </button>
          <button
            className={`lib-tab ${tab === 'recent' ? 'active' : ''}`}
            onClick={() => setTab('recent')}
          >
            🕐 Recently Played ({recentlyPlayed.length})
          </button>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="library-empty">
          <div className="library-empty-icon">{tab === 'liked' ? '♡' : '🎵'}</div>
          <p className="library-empty-title">
            {tab === 'liked' ? 'No liked songs yet' : 'Nothing played yet'}
          </p>
          <p className="library-empty-sub">
            {tab === 'liked' ? 'Heart songs while listening to save them here.' : 'Start playing music and it will appear here.'}
          </p>
          <a href="/search" className="btn-gradient" style={{ display: 'inline-block', marginTop: 20, textDecoration: 'none' }}>
            Discover Music
          </a>
        </div>
      ) : (
        <div className="library-grid">
          {songs.map(song => (
            <SongCard key={song.id} song={song} queue={songs} />
          ))}
        </div>
      )}
    </div>
  );
}

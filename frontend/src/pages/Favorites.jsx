import React from 'react';
import SongCard from '../components/SongCard';
import { usePlayer } from '../context/PlayerContext';
import './Library.css'; // Reusing Library styles

export default function Favorites() {
  const { liked } = usePlayer();

  return (
    <div className="library-page">
      <div className="library-header">
        <h1 className="library-title gradient-text">Your Favorites</h1>
      </div>

      {liked.length === 0 ? (
        <div className="library-empty">
          <div className="library-empty-icon">♥</div>
          <p className="library-empty-title">No favorites yet</p>
          <p className="library-empty-sub">
            Heart songs while listening to save them to your favorites.
          </p>
          <a href="/search" className="btn-gradient" style={{ display: 'inline-block', marginTop: 20, textDecoration: 'none' }}>
            Discover Music
          </a>
        </div>
      ) : (
        <div className="library-grid">
          {liked.map(song => (
            <SongCard key={song.id} song={song} queue={liked} />
          ))}
        </div>
      )}
    </div>
  );
}

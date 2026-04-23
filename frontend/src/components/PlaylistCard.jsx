import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PlaylistCard.css';

export default function PlaylistCard({ mood }) {
  const navigate = useNavigate();
  const handleClick = () => navigate(`/search?q=${encodeURIComponent(mood.query)}`);

  return (
    <div className="playlist-card" style={{ '--card-gradient': mood.gradient }} onClick={handleClick}>
      <div className="playlist-card-bg" />
      <div className="playlist-card-content">
        <div className="playlist-card-icon">🎵</div>
        <p className="playlist-card-name">{mood.name}</p>
        <p className="playlist-card-sub">Playlist</p>
      </div>
      <div className="playlist-card-arrow">→</div>
    </div>
  );
}

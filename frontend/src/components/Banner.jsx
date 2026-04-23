import React, { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useUser } from '../context/UserContext';
import './Banner.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Banner() {
  const [featured, setFeatured] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { playSong } = usePlayer();
  const { userName } = useUser();

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    fetch(`${API}/api/trending`)
      .then(r => r.json())
      .then(data => {
        if (data.results?.length) setFeatured(data.results[0]);
      })
      .catch(() => {});
  }, []);

  if (!featured) return <div className="banner-skeleton skeleton" />;

  return (
    <div 
      className={`banner ${isExpanded ? 'expanded' : ''}`} 
      style={{ '--thumb': `url(${featured.thumbnail})` }}
      onClick={() => setIsExpanded(prev => !prev)}
    >
      <div className="banner-bg" />
      <div className="banner-content fade-in">
        <span className="banner-tag">🔥 Trending Now</span>
        {userName && (
          <p className="banner-greeting">{getTimeGreeting()}, <strong>{userName}</strong> 👋</p>
        )}
        <h1 className="banner-title">{featured.title}</h1>
        <p className="banner-artist">{featured.artist}</p>
        <div className="banner-actions">
          <button 
            className="btn-gradient banner-play" 
            onClick={(e) => {
              e.stopPropagation();
              playSong(featured);
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Play Now
          </button>
          <button 
            className="banner-info-btn"
            onClick={(e) => e.stopPropagation()}
          >
            {featured.duration}
          </button>
        </div>
      </div>
      <div className="banner-art">
        <img src={featured.thumbnail} alt={featured.title} className="banner-img" />
        <div className="banner-img-glow" />
      </div>
    </div>
  );
}

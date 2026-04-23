import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import './SongCard.css';

export default function SongCard({ song, queue = [] }) {
  const { playSong, currentSong, isPlaying, toggleLike, isLiked } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  const handlePlay = (e) => {
    e.stopPropagation();
    playSong(song, queue.length ? queue : [song]);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    toggleLike(song);
  };

  return (
    <div className={`song-card ${isActive ? 'active' : ''}`} onClick={handlePlay}>
      <div className="song-card-thumb-wrap">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="song-card-thumb"
          loading="lazy"
          onError={e => { e.target.src = `https://img.youtube.com/vi/${song.id}/hqdefault.jpg`; }}
        />
        <div className="song-card-overlay">
          {isActive && isPlaying ? (
            <div className="playing-bars">
              <span/><span/><span/>
            </div>
          ) : (
            <button className="song-card-play-btn" aria-label="Play">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
          )}
        </div>
      </div>

      <div className="song-card-info">
        <p className="song-card-title" title={song.title}>{song.title}</p>
        <p className="song-card-artist" title={song.artist}>{song.artist}</p>
      </div>

      <div className="song-card-footer">
        <span className="song-card-duration">{song.duration}</span>
        <button
          className={`song-card-like ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          aria-label="Like"
        >
          {liked ? '♥' : '♡'}
        </button>
      </div>
    </div>
  );
}

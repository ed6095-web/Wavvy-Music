import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [liked, setLiked] = useState(() => JSON.parse(localStorage.getItem('wavvy_liked') || '[]'));
  const [recentlyPlayed, setRecentlyPlayed] = useState(() =>
    JSON.parse(localStorage.getItem('wavvy_recent') || '[]')
  );
  const [playCounts, setPlayCounts] = useState(() => 
    JSON.parse(localStorage.getItem('wavvy_playcounts') || '{}')
  );
  const [offlineSongs, setOfflineSongs] = useState(() => 
    JSON.parse(localStorage.getItem('wavvy_offline') || '[]')
  );
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Setup HTML5 Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => handleNext();
    const handlePlaying = () => { setIsPlaying(true); setIsLoading(false); };
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleError = (e) => {
      console.warn("Audio stream error, skipping...", e);
      handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('error', handleError);
    };
  }, [/* dependencies handled by stable functions or ref */]);

  // Handle MediaSession API for lock screen and notification controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        artwork: [{ src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' }]
      });

      navigator.mediaSession.setActionHandler('play', () => audioRef.current.play());
      navigator.mediaSession.setActionHandler('pause', () => audioRef.current.pause());
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
    }
  }, [currentSong]);

  // Sync volume
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  // Handle play state sync
  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Play prevented", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const playSong = useCallback((song, songQueue = null) => {
    if (!song) return;
    setIsLoading(true);
    setCurrentSong(song);
    
    if (songQueue) {
      setQueue(songQueue);
      setQueueIndex(songQueue.findIndex(s => s.id === song.id) || 0);
    }

    // Set Audio Source to Backend Stream
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    audioRef.current.src = `${API}/api/song/stream/${song.id}`;
    audioRef.current.load();
    setIsPlaying(true); // Triggers play in useEffect

    // Track recently played
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      const updated = [song, ...filtered].slice(0, 20);
      localStorage.setItem('wavvy_recent', JSON.stringify(updated));
      return updated;
    });

    // Track play counts & auto-offline
    setPlayCounts(prev => {
      const counts = { ...prev };
      counts[song.id] = (counts[song.id] || 0) + 1;
      localStorage.setItem('wavvy_playcounts', JSON.stringify(counts));
      
      // Auto-save to offline if played >= 5 times
      if (counts[song.id] >= 5) {
        setOfflineSongs(offPrev => {
          if (!offPrev.find(s => s.id === song.id)) {
            const newOffline = [song, ...offPrev];
            localStorage.setItem('wavvy_offline', JSON.stringify(newOffline));
            return newOffline;
          }
          return offPrev;
        });
      }
      return counts;
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;
    setIsPlaying(p => !p);
  }, [currentSong]);

  const handleNext = useCallback(async () => {
    if (queue.length === 0) return;
    let nextIdx = queueIndex + 1;
    if (shuffle) nextIdx = Math.floor(Math.random() * queue.length);
    
    if (nextIdx >= queue.length) {
      if (repeat) {
        nextIdx = 0;
      } else {
        // Auto-play feature: fetch related song
        setIsLoading(true);
        try {
          const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          const artist = currentSong?.artist || '';
          const title = currentSong?.title || '';
          const res = await fetch(`${API}/api/search/autoplay?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
          const data = await res.json();
          
          if (data.song) {
            const newQueue = [...queue, ...data.queue];
            setQueue(newQueue);
            setQueueIndex(nextIdx);
            playSong(data.song, newQueue);
            return;
          }
        } catch (e) {
          console.error("Autoplay fetch failed", e);
        }
        
        setIsPlaying(false);
        setIsLoading(false);
        return;
      }
    }
    setQueueIndex(nextIdx);
    playSong(queue[nextIdx], queue);
  }, [queue, queueIndex, shuffle, repeat, playSong, currentSong]);

  const handlePrev = useCallback(() => {
    if (currentTime > 3) { 
      seek(0); 
      return; 
    }
    if (queue.length === 0) return;
    const prevIdx = Math.max(0, queueIndex - 1);
    setQueueIndex(prevIdx);
    playSong(queue[prevIdx], queue);
  }, [queue, queueIndex, playSong, currentTime]);

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const toggleLike = useCallback((song) => {
    setLiked(prev => {
      const exists = prev.find(s => s.id === song.id);
      const updated = exists ? prev.filter(s => s.id !== song.id) : [song, ...prev];
      localStorage.setItem('wavvy_liked', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isLiked = useCallback((id) => liked.some(s => s.id === id), [liked]);

  // Hook dependencies setup above means we must keep handleNext, handlePrev stable 
  // which they are via useCallback.

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, currentTime, duration, volume, isLoading,
      shuffle, repeat, liked, recentlyPlayed, queue, offlineSongs, playCounts,
      playSong, togglePlay, handleNext, handlePrev, seek,
      setVolume, toggleLike, isLiked,
      setShuffle, setRepeat,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be inside PlayerProvider');
  return ctx;
};

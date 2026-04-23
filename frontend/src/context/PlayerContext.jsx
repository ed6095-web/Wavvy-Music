import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';
import { Capacitor } from '@capacitor/core';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
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

  // Initialize background mode when first mounted
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      BackgroundMode.enable();
      BackgroundMode.setSettings({
        title: "Wavvy Music",
        text: "Background mode enabled",
        icon: "ic_launcher",
        color: "7B2FFF",
        resume: true,
        hidden: false,
        bigText: false
      });
    }
  }, []);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current.currentTime);
      });

      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
        setIsLoading(false);
      });

      audioRef.current.addEventListener('ended', () => {
        handleNext();
      });

      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('waiting', () => setIsLoading(true));
      audioRef.current.addEventListener('playing', () => setIsLoading(false));
      
      audioRef.current.addEventListener('error', (e) => {
        console.error("Audio error:", e);
        setIsLoading(false);
        // Automatically skip to next on error
        handleNext();
      });
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Set Media Session metadata for lock screen & notification controls
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: 'Wavvy',
        artwork: [
          { src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        seek(details.seekTime);
      });
    }
  }, [currentSong, isPlaying]);

  const playSong = useCallback((song, songQueue = null) => {
    if (!song) return;
    setIsLoading(true);
    setCurrentSong(song);
    
    if (songQueue) {
      setQueue(songQueue);
      setQueueIndex(songQueue.findIndex(s => s.id === song.id) || 0);
    }

    if (Capacitor.isNativePlatform()) {
      BackgroundMode.setSettings({ text: `${song.title} - ${song.artist}` });
    }

    // Set audio source to our backend stream route
    const streamUrl = `${API}/api/song/stream/${song.id}`;
    if (audioRef.current) {
      audioRef.current.src = streamUrl;
      audioRef.current.play().catch(e => {
        console.error("Play prevented", e);
        setIsPlaying(false);
      });
    }

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
    if (!currentSong || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }, [isPlaying, currentSong]);

  const handleNext = useCallback(async () => {
    if (queue.length === 0) return;
    let nextIdx = queueIndex + 1;
    if (shuffle) nextIdx = Math.floor(Math.random() * queue.length);
    
    if (nextIdx >= queue.length) {
      if (repeat) {
        nextIdx = 0;
      } else {
        setIsLoading(true);
        try {
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

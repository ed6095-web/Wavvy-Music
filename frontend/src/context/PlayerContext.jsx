import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import YouTube from 'react-youtube';
import { BackgroundMode } from '@anuradev/capacitor-background-mode';
import { Capacitor } from '@capacitor/core';

const PlayerContext = createContext(null);

// Tiny 1-second silent MP3 in base64 — used to activate MediaSession on Android
const SILENT_MP3 = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//OEZAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACGgCioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAD/84RkAAADSAAAAABJTgAAAABZSgAAAACOTgAAAABJTgAAAABZSgAAAACOTgAAAABJTgAAAABZSgAAAACOTgAAAABJTgAAAABZSgAAAACOTgAAAABJTgAAAABZSgAAAACOTgAAAA==';

export function PlayerProvider({ children }) {
  const ytPlayerRef = useRef(null);
  const silentAudioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [liked, setLiked] = useState(() => JSON.parse(localStorage.getItem('wavvy_liked') || '[]'));
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => JSON.parse(localStorage.getItem('wavvy_recent') || '[]'));
  const [playCounts, setPlayCounts] = useState(() => JSON.parse(localStorage.getItem('wavvy_playcounts') || '{}'));
  const [offlineSongs, setOfflineSongs] = useState(() => JSON.parse(localStorage.getItem('wavvy_offline') || '[]'));
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Enable background mode on native
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      BackgroundMode.enable();
    }
  }, []);

  // Set up silent audio + MediaSession for notification controls
  useEffect(() => {
    if (!silentAudioRef.current) {
      silentAudioRef.current = new Audio(SILENT_MP3);
      silentAudioRef.current.loop = true;
    }
  }, []);

  // Update MediaSession whenever song changes
  useEffect(() => {
    if (!currentSong || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title || 'Unknown',
      artist: currentSong.artist || 'Unknown Artist',
      album: 'Wavvy',
      artwork: [{ src: currentSong.thumbnail || '', sizes: '512x512', type: 'image/jpeg' }]
    });

    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev());
    navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
  }, [currentSong]);

  // Sync MediaSession state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    if (silentAudioRef.current) {
      if (isPlaying) {
        silentAudioRef.current.play().catch(() => {});
      } else {
        silentAudioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Poll YT player time
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        if (ytPlayerRef.current?.getCurrentTime) {
          setCurrentTime(ytPlayerRef.current.getCurrentTime());
          const dur = ytPlayerRef.current.getDuration();
          if (dur) setDuration(dur);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sync volume
  useEffect(() => {
    if (ytPlayerRef.current?.setVolume) {
      ytPlayerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  const handleNext = useCallback(async () => {
    if (queue.length === 0) return;
    let nextIdx = shuffle ? Math.floor(Math.random() * queue.length) : queueIndex + 1;
    if (nextIdx >= queue.length) {
      if (repeat) { nextIdx = 0; }
      else {
        try {
          const res = await fetch(`${API}/api/search/autoplay?artist=${encodeURIComponent(currentSong?.artist || '')}&title=${encodeURIComponent(currentSong?.title || '')}`);
          const data = await res.json();
          if (data.song) {
            const newQueue = [...queue, ...data.queue];
            setQueue(newQueue);
            setQueueIndex(nextIdx);
            playSong(data.song, newQueue);
            return;
          }
        } catch (e) {}
        setIsPlaying(false); setIsLoading(false); return;
      }
    }
    setQueueIndex(nextIdx);
    playSong(queue[nextIdx], queue);
  }, [queue, queueIndex, shuffle, repeat, currentSong]);

  const handlePrev = useCallback(() => {
    if (currentTime > 3) { seek(0); return; }
    if (!queue.length) return;
    const prevIdx = Math.max(0, queueIndex - 1);
    setQueueIndex(prevIdx);
    playSong(queue[prevIdx], queue);
  }, [queue, queueIndex, currentTime]);

  const playSong = useCallback((song, songQueue = null) => {
    if (!song) return;
    setIsLoading(true);
    setCurrentSong(song);
    if (songQueue) {
      setQueue(songQueue);
      setQueueIndex(songQueue.findIndex(s => s.id === song.id) || 0);
    }
    if (Capacitor.isNativePlatform()) {
      BackgroundMode.setSettings({ title: 'Wavvy', text: `${song.title} - ${song.artist}` });
    }
    setRecentlyPlayed(prev => {
      const updated = [song, ...prev.filter(s => s.id !== song.id)].slice(0, 20);
      localStorage.setItem('wavvy_recent', JSON.stringify(updated));
      return updated;
    });
    setPlayCounts(prev => {
      const counts = { ...prev, [song.id]: (prev[song.id] || 0) + 1 };
      localStorage.setItem('wavvy_playcounts', JSON.stringify(counts));
      if (counts[song.id] >= 5) {
        setOfflineSongs(off => {
          if (!off.find(s => s.id === song.id)) {
            const updated = [song, ...off];
            localStorage.setItem('wavvy_offline', JSON.stringify(updated));
            return updated;
          }
          return off;
        });
      }
      return counts;
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentSong || !ytPlayerRef.current) return;
    if (isPlaying) ytPlayerRef.current.pauseVideo();
    else ytPlayerRef.current.playVideo();
  }, [isPlaying, currentSong]);

  const seek = useCallback((time) => {
    if (ytPlayerRef.current) { ytPlayerRef.current.seekTo(time, true); setCurrentTime(time); }
  }, []);

  const toggleLike = useCallback((song) => {
    setLiked(prev => {
      const updated = prev.find(s => s.id === song.id) ? prev.filter(s => s.id !== song.id) : [song, ...prev];
      localStorage.setItem('wavvy_liked', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isLiked = useCallback((id) => liked.some(s => s.id === id), [liked]);

  const onPlayerReady = (e) => {
    ytPlayerRef.current = e.target;
    e.target.setVolume(volume * 100);
    e.target.playVideo();
  };

  const onPlayerStateChange = (e) => {
    if (e.data === 1) { setIsPlaying(true); setIsLoading(false); setDuration(e.target.getDuration()); }
    else if (e.data === 2) { setIsPlaying(false); }
    else if (e.data === 0) { handleNext(); }
    else if (e.data === 3) { setIsLoading(true); }
  };

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, currentTime, duration, volume, isLoading,
      shuffle, repeat, liked, recentlyPlayed, queue, offlineSongs, playCounts,
      playSong, togglePlay, handleNext, handlePrev, seek,
      setVolume, toggleLike, isLiked, setShuffle, setRepeat,
    }}>
      {currentSong && (
        <div style={{ display: 'none' }}>
          <YouTube
            videoId={currentSong.id}
            opts={{ height: '1', width: '1', playerVars: { autoplay: 1, controls: 0, playsinline: 1 } }}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            onError={() => handleNext()}
          />
        </div>
      )}
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be inside PlayerProvider');
  return ctx;
};

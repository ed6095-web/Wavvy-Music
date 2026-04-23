import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import YouTube from 'react-youtube';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const ytPlayerRef = useRef(null);
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

  // Sync volume when changed
  useEffect(() => {
    if (ytPlayerRef.current && ytPlayerRef.current.setVolume) {
      ytPlayerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  // Polling for current time
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(async () => {
        if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
          const time = await ytPlayerRef.current.getCurrentTime();
          setCurrentTime(time);
          const dur = await ytPlayerRef.current.getDuration();
          if (dur) setDuration(dur);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const playSong = useCallback((song, songQueue = null) => {
    if (!song) return;
    setIsLoading(true);
    setCurrentSong(song);
    
    if (songQueue) {
      setQueue(songQueue);
      setQueueIndex(songQueue.findIndex(s => s.id === song.id) || 0);
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
    if (!currentSong || !ytPlayerRef.current) return;
    if (isPlaying) {
      ytPlayerRef.current.pauseVideo();
    } else {
      ytPlayerRef.current.playVideo();
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
        // Auto-play feature: fetch related song
        setIsLoading(true);
        try {
          const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          const artist = currentSong?.artist || '';
          const title = currentSong?.title || '';
          const res = await fetch(`${API}/api/search/autoplay?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
          const data = await res.json();
          
          if (data.song) {
            const newQueue = [...queue, data.song];
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
    if (ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(time, true);
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

  const onPlayerReady = (e) => {
    ytPlayerRef.current = e.target;
    e.target.setVolume(volume * 100);
  };

  const onPlayerStateChange = (e) => {
    // 1 = playing, 2 = paused, 0 = ended, 3 = buffering
    if (e.data === 1) {
      setIsPlaying(true);
      setIsLoading(false);
      setDuration(e.target.getDuration());
    } else if (e.data === 2) {
      setIsPlaying(false);
    } else if (e.data === 0) {
      handleNext();
    } else if (e.data === 3) {
      setIsLoading(true);
    }
  };

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, currentTime, duration, volume, isLoading,
      shuffle, repeat, liked, recentlyPlayed, queue, offlineSongs, playCounts,
      playSong, togglePlay, handleNext, handlePrev, seek,
      setVolume, toggleLike, isLiked,
      setShuffle, setRepeat,
    }}>
      {/* Hidden YouTube iframe handles the actual playback perfectly! */}
      {currentSong && (
        <div style={{ display: 'none' }}>
          <YouTube
            videoId={currentSong.id}
            opts={{
              height: '0',
              width: '0',
              playerVars: { autoplay: 1, controls: 0 }
            }}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            onError={() => {
              console.warn('YouTube Player Error. Skipping to next...');
              handleNext();
            }}
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

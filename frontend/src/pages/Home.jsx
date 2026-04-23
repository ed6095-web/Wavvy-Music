import React, { useEffect, useState } from 'react';
import Banner from '../components/Banner';
import SongCard from '../components/SongCard';
import PlaylistCard from '../components/PlaylistCard';
import './Home.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [url]);
  return { data, loading };
}

function SkeletonRow() {
  return (
    <div className="scroll-row">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ width: 160, height: 200, borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
      ))}
    </div>
  );
}

export default function Home() {
  const { data: trendingData, loading: trendingLoading } = useFetch(`${API}/api/trending`);
  const { data: recommendedData, loading: recLoading } = useFetch(`${API}/api/recommended`);
  const { data: moodsData, loading: moodsLoading } = useFetch(`${API}/api/moods`);

  const recentlyPlayed = JSON.parse(localStorage.getItem('wavvy_recent') || '[]').slice(0, 10);

  return (
    <div className="home-page">
      <Banner />

      {/* Trending */}
      <section className="section fade-in">
        <div className="section-header">
          <h2 className="section-title">🔥 Trending Now</h2>
          <a href="/search?q=trending music 2024" className="section-see-all">See all →</a>
        </div>
        {trendingLoading ? <SkeletonRow /> : (
          <div className="scroll-row">
            {trendingData?.results?.map(song => (
              <SongCard key={song.id} song={song} queue={trendingData.results} />
            ))}
          </div>
        )}
      </section>

      {/* Mood Playlists */}
      <section className="section fade-in-delay-1">
        <div className="section-header">
          <h2 className="section-title">🎭 Mood Playlists</h2>
        </div>
        {moodsLoading ? <SkeletonRow /> : (
          <div className="scroll-row">
            {moodsData?.moods?.map(mood => (
              <PlaylistCard key={mood.id} mood={mood} />
            ))}
          </div>
        )}
      </section>

      {/* Recommended */}
      <section className="section fade-in-delay-2">
        <div className="section-header">
          <h2 className="section-title">✨ Recommended</h2>
          <a href="/search?q=popular music 2024" className="section-see-all">See all →</a>
        </div>
        {recLoading ? <SkeletonRow /> : (
          <div className="scroll-row">
            {recommendedData?.results?.map(song => (
              <SongCard key={song.id} song={song} queue={recommendedData.results} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section className="section fade-in-delay-3">
          <div className="section-header">
            <h2 className="section-title">🕐 Recently Played</h2>
          </div>
          <div className="scroll-row">
            {recentlyPlayed.map(song => (
              <SongCard key={song.id} song={song} queue={recentlyPlayed} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

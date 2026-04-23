import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import SongCard from '../components/SongCard';
import './Search.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const SUGGESTED = ['Arijit Singh', 'Top Hits 2024', 'Bollywood', 'Hip Hop', 'Lo-Fi', 'EDM', 'Pop', 'Classical'];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Live Suggestions state
  const [liveSuggestions, setLiveSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { 
      setQuery(q); 
      doSearch(q); 
      setShowDropdown(false);
    }
  }, [searchParams]);

  // Fetch live suggestions when user types
  useEffect(() => {
    const q = searchParams.get('q');
    if (!query.trim() || query === q) {
      setLiveSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/search/suggest?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setLiveSuggestions(data.suggestions || []);
        if (data.suggestions?.length) setShowDropdown(true);
      } catch (err) {
        console.error('Failed to fetch suggestions', err);
      }
    }, 300); // 300ms debounce
  }, [query, searchParams]);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true); setError(''); setResults([]);
    try {
      const res = await fetch(`${API}/api/search?q=${encodeURIComponent(q)}&limit=24`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setError('Search failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      setSearchParams({ q: query.trim() });
    }
  };

  const handleSuggest = (s) => { 
    setQuery(s); 
    setShowDropdown(false);
    setSearchParams({ q: s }); 
  };

  return (
    <div className="search-page">
      <form className="search-hero-form" onSubmit={handleSubmit}>
        <div className="search-hero-wrap" style={{ position: 'relative' }}>
          <svg className="search-hero-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            id="search-page-input"
            type="text"
            placeholder="What do you want to hear?"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (liveSuggestions.length) setShowDropdown(true);
            }}
            onBlur={() => {
              // Delay hiding so clicks on suggestions register first
              setTimeout(() => setShowDropdown(false), 200);
            }}
            className="search-hero-input"
            autoComplete="off"
          />
          {query && (
            <button type="button" className="search-hero-clear" onClick={() => {
              setQuery('');
              setLiveSuggestions([]);
              setShowDropdown(false);
              inputRef.current?.focus();
            }}>✕</button>
          )}

          {/* Live Suggestions Dropdown */}
          {showDropdown && liveSuggestions.length > 0 && (
            <ul className="live-suggestions-dropdown">
              {liveSuggestions.map((s, idx) => (
                <li key={idx} onMouseDown={() => handleSuggest(s)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="btn-gradient" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Suggested chips (only show when no query or results) */}
      {!results.length && !loading && !query && (
        <div className="search-suggestions">
          <p className="suggestions-label">Try searching for</p>
          <div className="suggestions-chips">
            {SUGGESTED.map(s => (
              <button key={s} className="suggestion-chip" onClick={() => handleSuggest(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="search-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && <p className="search-error">{error}</p>}

      {/* Results */}
      {results.length > 0 && (
        <>
          <p className="results-count">{results.length} results for "<strong>{searchParams.get('q')}</strong>"</p>
          <div className="search-grid">
            {results.map(song => (
              <SongCard key={song.id} song={song} queue={results} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import logo from '../assets/logo.svg';
import './Navbar.css';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const { userName, getInitials, showAccountMenu, setShowAccountMenu, logout, setShowOnboarding } = useUser();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setShowAccountMenu]);

  return (
    <nav className="navbar glass">
      <Link to="/" className="nav-logo">
        <img src={logo} alt="Wavvy" className="nav-logo-img" />
        <span className="nav-logo-text gradient-text">Wavvy</span>
      </Link>

      <form className="nav-search" onSubmit={handleSearch}>
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search songs, artists..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="search-input"
            id="navbar-search"
          />
          {query && (
            <button type="button" className="search-clear" onClick={() => setQuery('')}>✕</button>
          )}
        </div>
      </form>

      {/* Account section */}
      <div className="nav-right" ref={menuRef}>
        <button
          className="nav-avatar"
          id="account-btn"
          title={userName || 'Profile'}
          onClick={() => setShowAccountMenu(v => !v)}
        >
          <span>{getInitials(userName)}</span>
        </button>

        {/* Dropdown menu */}
        <div className={`account-dropdown glass ${showAccountMenu ? 'open' : ''}`}>
          <div className="account-dropdown-header">
            <div className="account-avatar-large">
              <span>{getInitials(userName)}</span>
            </div>
            <div className="account-info">
              <p className="account-name">{userName || 'Wavvy User'}</p>
              <p className="account-sub">Music Lover 🎵</p>
            </div>
          </div>

          <div className="account-dropdown-divider" />

          <ul className="account-menu-list">
            <li>
              <button
                id="edit-name-btn"
                className="account-menu-item"
                onClick={() => { setShowOnboarding(true); setShowAccountMenu(false); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Name
              </button>
            </li>
            <li>
              <button
                id="library-btn"
                className="account-menu-item"
                onClick={() => { navigate('/library'); setShowAccountMenu(false); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                </svg>
                My Library
              </button>
            </li>
            <li>
              <button
                id="logout-btn"
                className="account-menu-item danger"
                onClick={logout}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

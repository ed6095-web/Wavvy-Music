import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const mainNavItems = [
  {
    to: '/', label: 'Home', exact: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
    ),
  },
  {
    to: '/search', label: 'Search',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    to: '/library', label: 'Library',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
    ),
  },
];

const allSidebarItems = [
  ...mainNavItems,
  {
    to: '/favorites', label: 'Favorites',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    ),
  },
  {
    to: '/offline', label: 'Offline',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
    ),
  },
];

const moreItems = [
  {
    to: '/favorites', label: 'Favorites',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    ),
  },
  {
    to: '/offline', label: 'Offline',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
    ),
  },
];

export default function Sidebar() {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar glass">
        <nav className="sidebar-nav">
          {allSidebarItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-moods">
          <p className="sidebar-section-title">Moods</p>
          {['Happy', 'Chill', 'Workout', 'Focus', 'Sad', 'Party'].map(mood => (
            <a key={mood} href={`/search?q=${mood.toLowerCase()} music`} className="mood-chip">
              {mood}
            </a>
          ))}
        </div>
      </aside>

      {/* Mobile Bottom Nav — 3 tabs + "More" */}
      <nav className="bottom-nav glass">
        {mainNavItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setShowMore(false)}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}

        {/* More button */}
        <button
          className={`bottom-nav-item bottom-nav-btn ${showMore ? 'active' : ''}`}
          onClick={() => setShowMore(v => !v)}
        >
          <span className="bottom-nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </span>
          <span className="bottom-nav-label">More</span>
        </button>
      </nav>

      {/* More menu popup */}
      {showMore && (
        <div className="more-menu glass">
          {moreItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `more-menu-item ${isActive ? 'active' : ''}`}
              onClick={() => setShowMore(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
}

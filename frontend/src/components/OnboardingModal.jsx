import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import './OnboardingModal.css';

const GREETINGS = ['Hey there!', 'Hello, superstar!', 'Welcome aboard!', "Let's vibe!"];

export default function OnboardingModal() {
  const { showOnboarding, saveName } = useUser();
  const [name, setName] = useState('');
  const [greeting] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (showOnboarding) {
      setTimeout(() => setVisible(true), 50);
      setTimeout(() => inputRef.current?.focus(), 350);
    } else {
      setVisible(false);
    }
  }, [showOnboarding]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to continue.');
      inputRef.current?.focus();
      return;
    }
    setError('');
    saveName(name.trim());
  };

  if (!showOnboarding) return null;

  return (
    <div className={`onboarding-overlay ${visible ? 'visible' : ''}`}>
      {/* Animated bg orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className={`onboarding-card ${visible ? 'visible' : ''}`}>
        {/* Logo & brand */}
        <div className="ob-logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7B2FFF" />
                <stop offset="50%" stopColor="#E91E8C" />
                <stop offset="100%" stopColor="#FF3B30" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="24" fill="url(#logoGrad)" opacity="0.15" />
            <circle cx="24" cy="24" r="16" fill="url(#logoGrad)" opacity="0.25" />
            <path d="M18 32V16l18 8-18 8z" fill="url(#logoGrad)" />
          </svg>
          <span className="ob-brand gradient-text">Wavvy</span>
        </div>

        <h1 className="ob-heading">{greeting}</h1>
        <p className="ob-subtext">
          What should we call you? We'll personalize your music experience just for you 🎵
        </p>

        <form className="ob-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="ob-input-wrap">
            <svg className="ob-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              ref={inputRef}
              id="onboarding-name-input"
              type="text"
              className={`ob-input ${error ? 'error' : ''}`}
              placeholder="Enter your name..."
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              maxLength={32}
              autoComplete="off"
            />
            {name && (
              <button
                type="button"
                className="ob-clear"
                onClick={() => { setName(''); setError(''); inputRef.current?.focus(); }}
              >✕</button>
            )}
          </div>
          {error && <p className="ob-error">{error}</p>}

          <button
            type="submit"
            id="onboarding-submit-btn"
            className="ob-btn btn-gradient"
          >
            <span>Let's go</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>

        <p className="ob-footer">
          Your name is saved locally &amp; never shared 🔒
        </p>
      </div>
    </div>
  );
}

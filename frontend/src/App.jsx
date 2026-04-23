import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import OnboardingModal from './components/OnboardingModal';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Favorites from './pages/Favorites';
import Offline from './pages/Offline';
import './styles/global.css';

export default function App() {
  return (
    <UserProvider>
      <PlayerProvider>
        <BrowserRouter>
          {/* Onboarding appears as overlay on first visit */}
          <OnboardingModal />

          <div className="app-layout">
            <Navbar />
            <div className="app-body">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/offline" element={<Offline />} />
                </Routes>
              </main>
            </div>
            <Player />
          </div>
        </BrowserRouter>
      </PlayerProvider>
    </UserProvider>
  );
}

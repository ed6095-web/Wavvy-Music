import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userName, setUserName] = useState(() => localStorage.getItem('wavvy_username') || '');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    // Show onboarding if no username saved
    if (!localStorage.getItem('wavvy_username')) {
      setShowOnboarding(true);
    }
  }, []);

  const saveName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem('wavvy_username', trimmed);
    setUserName(trimmed);
    setShowOnboarding(false);
  };

  const logout = () => {
    localStorage.removeItem('wavvy_username');
    setUserName('');
    setShowOnboarding(true);
    setShowAccountMenu(false);
  };

  const getInitials = (name) => {
    if (!name) return 'W';
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <UserContext.Provider value={{
      userName, showOnboarding, showAccountMenu,
      saveName, logout, getInitials, setShowAccountMenu, setShowOnboarding
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
};

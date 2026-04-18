/**
 * DietaryContext.jsx
 * Global state for the user's selected dietary profile.
 */

import { createContext, useContext, useState } from 'react';

const DietaryContext = createContext(null);

export const DietaryProvider = ({ children }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);

  const selectProfile = (profileId) => {
    setSelectedProfile((prev) => (prev === profileId ? null : profileId));
  };

  const clearProfile = () => setSelectedProfile(null);

  return (
    <DietaryContext.Provider value={{ selectedProfile, selectProfile, clearProfile }}>
      {children}
    </DietaryContext.Provider>
  );
};

export const useDietary = () => {
  const ctx = useContext(DietaryContext);
  if (!ctx) throw new Error('useDietary must be used within a DietaryProvider');
  return ctx;
};

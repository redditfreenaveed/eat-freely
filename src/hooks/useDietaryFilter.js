import { useMemo, useState } from 'react';
import { filterRestaurants } from '../utils/tagCompatibility';
import { getProfileById } from '../utils/dietaryProfiles';
import { useDietary } from '../context/DietaryContext';

export const useDietaryFilter = (restaurants) => {
  const { selectedProfile, selectProfile, clearProfile } = useDietary();
  const [searchQuery, setSearchQuery] = useState('');

  const activeProfile = selectedProfile ? getProfileById(selectedProfile) : null;

  const filtered = useMemo(
    () => filterRestaurants(restaurants, activeProfile, searchQuery),
    [restaurants, activeProfile, searchQuery]
  );

  const toggleProfile = (id) => selectProfile(id);

  const clearFilters = () => {
    clearProfile();
    setSearchQuery('');
  };

  return {
    filtered,
    activeProfile,
    selectedProfileId: selectedProfile,
    searchQuery,
    setSearchQuery,
    toggleProfile,
    clearFilters,
  };
};

/**
 * useDietaryFilter.js
 * Custom hook — filters a list of restaurants based on the active dietary profile and search query.
 */

import { useMemo, useState } from 'react';
import { filterRestaurants } from '../utils/tagCompatibility';
import { getProfileById } from '../utils/dietaryProfiles';

export const useDietaryFilter = (restaurants) => {
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeProfile = selectedProfileId ? getProfileById(selectedProfileId) : null;

  const filtered = useMemo(
    () => filterRestaurants(restaurants, activeProfile, searchQuery),
    [restaurants, activeProfile, searchQuery]
  );

  const toggleProfile = (id) => {
    setSelectedProfileId((prev) => (prev === id ? null : id));
  };

  const clearFilters = () => {
    setSelectedProfileId(null);
    setSearchQuery('');
  };

  return {
    filtered,
    activeProfile,
    selectedProfileId,
    searchQuery,
    setSearchQuery,
    toggleProfile,
    clearFilters,
  };
};

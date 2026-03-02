/**
 * tagCompatibility.js
 * Utility functions for matching restaurants to dietary profiles.
 */

/**
 * Returns true if a restaurant is compatible with the given dietary profile.
 * A restaurant is compatible if it has at least one tag that the profile allows.
 */
export const isRestaurantCompatible = (restaurant, profile) => {
  if (!profile) return true;
  return restaurant.tags.some((tag) => profile.compatibleTags.includes(tag));
};

/**
 * Returns the subset of a restaurant's tags that match a given profile.
 */
export const getMatchingTags = (restaurant, profile) => {
  if (!profile) return restaurant.tags;
  return restaurant.tags.filter((tag) => profile.compatibleTags.includes(tag));
};

/**
 * Filters a list of restaurants by dietary profile and optional text query.
 */
export const filterRestaurants = (restaurants, profile, query = '') => {
  let results = restaurants;

  if (profile) {
    results = results.filter((r) => isRestaurantCompatible(r, profile));
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
    );
  }

  return results;
};

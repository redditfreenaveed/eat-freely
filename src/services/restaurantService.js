const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const getRestaurants = async () => {
  const res = await fetch(`${API_URL}/api/restaurants`);
  if (!res.ok) throw new Error('Failed to fetch restaurants');
  return res.json();
};

export const getRestaurantById = async (id) => {
  const res = await fetch(`${API_URL}/api/restaurants/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch restaurant');
  return res.json();
};

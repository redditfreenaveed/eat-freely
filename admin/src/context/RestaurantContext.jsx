import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const RestaurantContext = createContext(null);

export const RestaurantProvider = ({ children }) => {
  const { token } = useAuth();
  const [restaurants, setRestaurants] = useState([]);

  const authHeaders = useCallback(
    () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }),
    [token]
  );

  const loadRestaurants = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/api/admin/restaurants`, { headers: authHeaders() });
    if (res.ok) setRestaurants(await res.json());
  }, [token, authHeaders]);

  useEffect(() => { loadRestaurants(); }, [loadRestaurants]);

  const addRestaurant = async (data) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create restaurant');
    const created = await res.json();
    setRestaurants((prev) => [...prev, created]);
    return created.id;
  };

  const updateRestaurant = async (id, data) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${id}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update restaurant');
    const updated = await res.json();
    setRestaurants((prev) => prev.map((r) => (r.id === id ? updated : r)));
  };

  const deleteRestaurant = async (id) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${id}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete restaurant');
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  };

  const addSection = async (restaurantId, name) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${restaurantId}/menu/sections`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to add section');
    return res.json();
  };

  const updateSection = async (restaurantId, sectionId, name) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${restaurantId}/menu/sections/${sectionId}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to update section');
    return res.json();
  };

  const deleteSection = async (restaurantId, sectionId) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${restaurantId}/menu/sections/${sectionId}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete section');
  };

  const addItem = async (restaurantId, sectionId, item) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${restaurantId}/menu/sections/${sectionId}/items`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add item');
    return res.json();
  };

  const updateItem = async (restaurantId, itemId, item) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${restaurantId}/menu/items/${itemId}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update item');
    return res.json();
  };

  const deleteItem = async (restaurantId, itemId) => {
    const res = await fetch(`${API_URL}/api/admin/restaurants/${restaurantId}/menu/items/${itemId}`, {
      method: 'DELETE', headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete item');
  };

  return (
    <RestaurantContext.Provider value={{
      restaurants, addRestaurant, updateRestaurant, deleteRestaurant,
      addSection, updateSection, deleteSection, addItem, updateItem, deleteItem,
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurants = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurants must be used within RestaurantProvider');
  return ctx;
};

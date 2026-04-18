import { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import DietaryProfileSelector from '../../components/DietaryProfileSelector/DietaryProfileSelector';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import DetailDrawer from '../../components/DetailDrawer/DetailDrawer';
import { useDietaryFilter } from '../../hooks/useDietaryFilter';
import { getRestaurants } from '../../services/restaurantService';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const {
    filtered,
    activeProfile,
    selectedProfileId,
    searchQuery,
    setSearchQuery,
    toggleProfile,
    clearFilters,
  } = useDietaryFilter(restaurants);

  useEffect(() => {
    getRestaurants().then(setRestaurants);
  }, []);

  const hasActiveFilter = selectedProfileId || searchQuery.trim();

  return (
    <>
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <DietaryProfileSelector selectedId={selectedProfileId} onToggle={toggleProfile} />
      <main className="home-main">
        {hasActiveFilter && (
          <div className="results-bar">
            <span>
              {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''}
              {activeProfile ? ` · ${activeProfile.label}` : ''}
              {searchQuery.trim() ? ` · "${searchQuery}"` : ''}
            </span>
            <button className="results-bar__clear" onClick={clearFilters}>Clear</button>
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No restaurants match your filter.</p>
            <button onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="restaurant-list">
            {filtered.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                activeProfile={activeProfile}
                onClick={() => setSelectedRestaurant(r)}
              />
            ))}
          </div>
        )}
      </main>
      <DetailDrawer
        restaurant={selectedRestaurant}
        activeProfile={activeProfile}
        onClose={() => setSelectedRestaurant(null)}
      />
    </>
  );
}

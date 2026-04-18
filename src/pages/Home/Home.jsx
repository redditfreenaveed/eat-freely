import { useState } from 'react';
import Header from '../../components/Header/Header';
import DietaryProfileSelector from '../../components/DietaryProfileSelector/DietaryProfileSelector';
import RestaurantCard from '../../components/RestaurantCard/RestaurantCard';
import DetailDrawer from '../../components/DetailDrawer/DetailDrawer';
import { getProfileById } from '../../utils/dietaryProfiles';

const SAMPLE = {
  id: 1,
  name: 'Zam Zam Palace',
  cuisine: 'Middle Eastern',
  location: 'Downtown',
  rating: 4.8,
  tags: ['halal', 'vegetarian'],
  image: '🕌',
  priceRange: '$$',
  distance: '0.3 mi',
  highlights: ['Halal Certified', 'Family Friendly'],
  description: 'Authentic Middle Eastern flavors with a fully halal kitchen.',
};

export default function Home() {
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState('muslim');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const toggle = (id) => setSelectedId((prev) => (prev === id ? null : id));
  const activeProfile = selectedId ? getProfileById(selectedId) : null;
  return (
    <>
      <Header searchQuery={q} onSearchChange={setQ} />
      <DietaryProfileSelector selectedId={selectedId} onToggle={toggle} />
      <div style={{ padding: '16px', maxWidth: 640, margin: '0 auto' }}>
        <RestaurantCard
          restaurant={SAMPLE}
          activeProfile={activeProfile}
          onClick={() => setSelectedRestaurant(SAMPLE)}
        />
      </div>
      <DetailDrawer
        restaurant={selectedRestaurant}
        activeProfile={activeProfile}
        onClose={() => setSelectedRestaurant(null)}
      />
    </>
  );
}

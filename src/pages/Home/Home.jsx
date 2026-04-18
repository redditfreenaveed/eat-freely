import { useState } from 'react';
import Header from '../../components/Header/Header';
import DietaryProfileSelector from '../../components/DietaryProfileSelector/DietaryProfileSelector';

export default function Home() {
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const toggle = (id) => setSelectedId((prev) => (prev === id ? null : id));
  return (
    <>
      <Header searchQuery={q} onSearchChange={setQ} />
      <DietaryProfileSelector selectedId={selectedId} onToggle={toggle} />
    </>
  );
}

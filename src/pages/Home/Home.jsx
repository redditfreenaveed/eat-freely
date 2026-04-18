import { useState } from 'react';
import Header from '../../components/Header/Header';

export default function Home() {
  const [q, setQ] = useState('');
  return <Header searchQuery={q} onSearchChange={setQ} />;
}

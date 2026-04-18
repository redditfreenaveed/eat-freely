import SearchBar from '../SearchBar/SearchBar';

export default function Header({ searchQuery, onSearchChange }) {
  return (
    <header className="header">
      <div className="header__inner">
        <span className="header__title">Eat Freely</span>
        <SearchBar value={searchQuery} onChange={onSearchChange} />
      </div>
    </header>
  );
}

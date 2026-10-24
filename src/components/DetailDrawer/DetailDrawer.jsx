import { Link } from 'react-router-dom';
import TagBadge from '../TagBadge/TagBadge';

export default function DetailDrawer({ restaurant, activeProfile, onClose }) {
  if (!restaurant) return null;

  const matchedTags = activeProfile
    ? restaurant.tags.filter((t) => activeProfile.compatibleTags.includes(t))
    : [];

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer">
        <div className="drawer__handle-bar">
          <div className="drawer__handle" />
        </div>
        <div className="drawer__content">
          <div className="drawer__hero">
            <span className="drawer__icon">{restaurant.image}</span>
            <div>
              <div className="drawer__name">{restaurant.name}</div>
              <div className="drawer__meta">
                {restaurant.cuisine} · {restaurant.location} · {restaurant.priceRange} · {restaurant.distance} · {restaurant.rating}★
              </div>
            </div>
          </div>
          <div className="drawer__tags">
            {restaurant.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} matched={matchedTags.includes(tag)} />
            ))}
          </div>
          <p className="drawer__description">{restaurant.description}</p>
          <div className="drawer__highlights">
            {restaurant.highlights.map((h) => (
              <span key={h} className="drawer__highlight">{h}</span>
            ))}
          </div>
          <Link to={`/restaurant/${restaurant.id}`} className="drawer__full-link">
            View full details →
          </Link>
        </div>
      </div>
    </>
  );
}

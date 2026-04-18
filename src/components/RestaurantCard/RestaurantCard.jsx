import TagBadge from '../TagBadge/TagBadge';

export default function RestaurantCard({ restaurant, activeProfile, onClick }) {
  const matchedTags = activeProfile
    ? restaurant.tags.filter((t) => activeProfile.compatibleTags.includes(t))
    : [];

  return (
    <div className="restaurant-card" onClick={onClick}>
      <div className="restaurant-card__icon">{restaurant.image}</div>
      <div className="restaurant-card__body">
        <div className="restaurant-card__header">
          <span className="restaurant-card__name">{restaurant.name}</span>
          <span className="restaurant-card__rating">{restaurant.rating}★</span>
        </div>
        <div className="restaurant-card__meta">
          {restaurant.cuisine} · {restaurant.location} · {restaurant.priceRange} · {restaurant.distance}
        </div>
        <div className="restaurant-card__tags">
          {restaurant.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} matched={matchedTags.includes(tag)} />
          ))}
        </div>
      </div>
    </div>
  );
}

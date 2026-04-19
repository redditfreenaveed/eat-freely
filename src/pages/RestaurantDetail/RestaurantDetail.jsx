import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TagBadge from '../../components/TagBadge/TagBadge';
import { getRestaurantById } from '../../services/restaurantService';
import { useDietary } from '../../context/DietaryContext';
import { getProfileById } from '../../utils/dietaryProfiles';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedProfile } = useDietary();
  const [restaurant, setRestaurant] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const activeProfile = selectedProfile ? getProfileById(selectedProfile) : null;

  useEffect(() => {
    getRestaurantById(id).then((r) => {
      if (r) setRestaurant(r);
      else setNotFound(true);
    });
  }, [id]);

  if (notFound) {
    return (
      <>
        <div className="detail-header">
          <button className="detail-header__back" onClick={() => navigate('/')}>←</button>
          <span className="detail-header__title">eat freely</span>
        </div>
        <div className="empty-state">
          <p>Restaurant not found.</p>
          <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </>
    );
  }

  if (!restaurant) {
    return (
      <>
        <div className="detail-header">
          <button className="detail-header__back" onClick={() => navigate(-1)}>←</button>
          <span className="detail-header__title">eat freely</span>
        </div>
        <div className="empty-state"><p>Loading…</p></div>
      </>
    );
  }

  const matchedTags = activeProfile
    ? restaurant.tags.filter((t) => activeProfile.compatibleTags.includes(t))
    : [];

  return (
    <>
      <div className="detail-header">
        <button className="detail-header__back" onClick={() => navigate(-1)}>←</button>
        <span className="detail-header__title">eat freely</span>
      </div>
      <main className="detail-main">
        <div className="detail-hero">
          <span className="detail-hero__icon">{restaurant.image}</span>
          <div>
            <div className="detail-hero__name">{restaurant.name}</div>
            <div className="detail-hero__meta">
              {restaurant.cuisine} · {restaurant.location} · {restaurant.priceRange} · {restaurant.distance} · {restaurant.rating}★
            </div>
          </div>
        </div>

        <div className="detail-tags">
          {restaurant.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} matched={matchedTags.includes(tag)} />
          ))}
        </div>

        <p className="detail-description">{restaurant.description}</p>

        <div className="detail-highlights">
          {restaurant.highlights.map((h) => (
            <span key={h} className="detail-highlight">{h}</span>
          ))}
        </div>

        {restaurant.menu && (
          <div className="detail-menu">
            <h2 className="detail-menu__heading">Menu</h2>
            {restaurant.menu.map((section) => (
              <div key={section.section} className="detail-menu__section">
                <h3 className="detail-menu__section-title">{section.section}</h3>
                {section.items.map((item) => {
                  const compatible = activeProfile
                    ? item.tags.some((t) => activeProfile.compatibleTags.includes(t))
                    : false;
                  return (
                    <div
                      key={item.name}
                      className={`detail-menu__item${compatible ? ' detail-menu__item--matched' : ''}`}
                    >
                      <div className="detail-menu__item-header">
                        <span className="detail-menu__item-name">{item.name}</span>
                        <span className="detail-menu__item-price">{item.price}</span>
                      </div>
                      <p className="detail-menu__item-desc">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

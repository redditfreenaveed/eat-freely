import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader/AdminHeader';
import TagSelector from '../../components/TagSelector/TagSelector';
import MenuManager from '../../components/MenuManager/MenuManager';
import { useRestaurants } from '../../context/RestaurantContext';

const EMPTY = {
  name: '', cuisine: '', location: '', priceRange: '$', image: '',
  rating: '', distance: '', description: '', tags: [], highlights: [], menu: [],
};

export default function RestaurantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addRestaurant, updateRestaurant } = useRestaurants();
  const isNew = id === 'new';

  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!isNew) {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      fetch(`${API_URL}/api/restaurants/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.id) setForm(data);
          else navigate('/dashboard', { replace: true });
        })
        .catch(() => navigate('/dashboard', { replace: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      rating: parseFloat(form.rating) || 0,
      highlights: form.highlights.filter(Boolean),
    };
    try {
      if (isNew) {
        await addRestaurant(data);
      } else {
        await updateRestaurant(Number(id), data);
      }
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <AdminHeader />
      <main className="admin-main">
        <h1 className="page-title">{isNew ? 'Add Restaurant' : `Edit: ${form.name}`}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-card">
            <div className="form-card__title">Restaurant Details</div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Cuisine</label>
                <input className="form-input" required value={form.cuisine} onChange={(e) => set('cuisine', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" required value={form.location} onChange={(e) => set('location', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Price Range</label>
                <select className="form-select" value={form.priceRange} onChange={(e) => set('priceRange', e.target.value)}>
                  <option value="$">$ — Budget</option>
                  <option value="$$">$$ — Moderate</option>
                  <option value="$$$">$$$ — Upscale</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Emoji Icon</label>
                <input className="form-input" placeholder="e.g. 🍛" value={form.image} onChange={(e) => set('image', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Rating (0–5)</label>
                <input className="form-input" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => set('rating', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Distance</label>
                <input className="form-input" placeholder="e.g. 0.5 mi" value={form.distance} onChange={(e) => set('distance', e.target.value)} />
              </div>
              <div className="form-group form-group--full">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div className="form-group form-group--full">
                <label className="form-label">Dietary Tags</label>
                <TagSelector selected={form.tags} onChange={(tags) => set('tags', tags)} />
              </div>
              <div className="form-group form-group--full">
                <label className="form-label">Highlights</label>
                <div className="highlights-list">
                  {[...form.highlights, ''].map((h, idx) => (
                    <div key={idx} className="highlight-row">
                      <input
                        className="form-input"
                        placeholder="e.g. Halal Certified"
                        value={h}
                        onChange={(e) => {
                          const updated = [...form.highlights];
                          if (idx === form.highlights.length) updated.push(e.target.value);
                          else updated[idx] = e.target.value;
                          set('highlights', updated.filter((_, i) => i < updated.length - 1 || updated[i]));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-card__title">Menu</div>
            <MenuManager menu={form.menu} onChange={(menu) => set('menu', menu)} />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn--primary">{isNew ? 'Create Restaurant' : 'Save Changes'}</button>
          </div>
        </form>
      </main>
    </>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader/AdminHeader';
import { useRestaurants } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { restaurants, deleteRestaurant } = useRestaurants();
  const { role } = useAuth();
  const navigate = useNavigate();

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) deleteRestaurant(id);
  };

  return (
    <>
      <AdminHeader />
      <main className="admin-main">
        <div className="dashboard-toolbar">
          <h1 className="page-title" style={{ margin: 0 }}>Restaurants</h1>
          {role === 'admin' && (
            <Link to="/restaurant/new">
              <button className="btn btn--primary">+ Add Restaurant</button>
            </Link>
          )}
        </div>
        <table className="restaurant-table">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Cuisine</th>
              <th>Location</th>
              <th>Rating</th>
              <th>Tags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.image} {r.name}</strong></td>
                <td>{r.cuisine}</td>
                <td>{r.location}</td>
                <td>{r.rating}★</td>
                <td style={{ fontSize: 11, color: '#64748b' }}>{r.tags.join(', ')}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn--ghost btn--small" onClick={() => navigate(`/restaurant/${r.id}`)}>Edit</button>
                    {role === 'admin' && (
                      <button className="btn btn--danger btn--small" onClick={() => handleDelete(r.id, r.name)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}

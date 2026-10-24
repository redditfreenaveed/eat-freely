import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader() {
  const { role, logout } = useAuth();

  return (
    <header className="admin-header">
      <Link to="/dashboard" className="admin-header__brand">
        🍽️ <span>Eat Freely Admin</span>
      </Link>
      <div className="admin-header__right">
        <span className="admin-header__role">
          {role === 'admin' ? '🛡️ Admin' : '🍴 Restaurant Owner'}
        </span>
        <button className="admin-header__signout" onClick={logout}>Sign out</button>
      </div>
    </header>
  );
}

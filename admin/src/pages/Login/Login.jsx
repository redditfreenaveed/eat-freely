import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    login(role);
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🍽️</div>
        <h1 className="login-title">Eat Freely Admin</h1>
        <p className="login-subtitle">Choose how you're signing in</p>
        <div className="login-options">
          <button className="login-btn login-btn--admin" onClick={() => handleLogin('admin')}>
            <span className="login-btn__icon">🛡️</span>
            <div>
              <div className="login-btn__label">Sign in as Admin</div>
              <div className="login-btn__desc">Manage all restaurants</div>
            </div>
          </button>
          <button className="login-btn login-btn--owner" onClick={() => handleLogin('owner')}>
            <span className="login-btn__icon">🍴</span>
            <div>
              <div className="login-btn__label">Sign in as Restaurant Owner</div>
              <div className="login-btn__desc">Manage your restaurant</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

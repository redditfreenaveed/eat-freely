import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RestaurantProvider } from './context/RestaurantContext';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import RestaurantForm from './pages/RestaurantForm/RestaurantForm';
import './styles/global.css';

function RequireAuth({ children }) {
  const { role } = useAuth();
  return role ? children : <Navigate to="/" replace />;
}

function OwnerRedirect() {
  const { role } = useAuth();
  if (role === 'owner') return <Navigate to="/restaurant/1" replace />;
  return <Dashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<RequireAuth><OwnerRedirect /></RequireAuth>} />
      <Route path="/restaurant/:id" element={<RequireAuth><RestaurantForm /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RestaurantProvider>
    </AuthProvider>
  );
}

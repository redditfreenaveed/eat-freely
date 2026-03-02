import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DietaryProvider } from './context/DietaryContext';
import Home from './pages/Home/Home';
import RestaurantDetail from './pages/RestaurantDetail/RestaurantDetail';
import NotFound from './pages/NotFound/NotFound';
import './styles/global.css';

export default function App() {
  return (
    <DietaryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DietaryProvider>
  );
}

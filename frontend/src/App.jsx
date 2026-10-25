import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/layout/Header.jsx';
import HomePage from './pages/HomePage.jsx';
import Signup from './pages/Signup.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import TripDetails from './pages/TripDetails.jsx';
import MyTrips from './pages/MyTrips.jsx';

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/trips/:tripId" element={<TripDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
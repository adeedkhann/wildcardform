import './App.css';
import Input from './components/Input';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router';
import Verification from './components/Verification';
import { ToastContainer } from 'react-toastify';
import { useState } from 'react';
import Finalpage from './components/Finalpage';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

function AppContent() {
  const [useremail, setUserEmail] = useState();
  const handleevent = (email) => {
    setUserEmail(email);
  }

  const location = useLocation();

  // FIX 1: React Router v7 useLocation returns the absolute pathname including the base path.
  // This matches both local development ('/') and production ('/wildcard' or '/wildcard/') accurately.
  const isScrollable = location.pathname === '/' || location.pathname === '/wildcard' || location.pathname === '/wildcard/';

  // FIX 2: Dynamically prepend the homepage public URL configuration path for assets so they don't break on deployment
  const publicUrl = process.env.PUBLIC_URL || '';

  return (
    <>
      {/* LAYER 1: Fixed background — gradient + decorative balls */}
      <div className="bg-layer">
        <div className="top-right">
          <img src={`${publicUrl}/top-right.png`} alt="" height="100%" width="100%" />
        </div>
        <div className="bottom-right">
          <img src={`${publicUrl}/bottom-right.png`} alt="" height="100%" width="100%" />
        </div>
        <div className="top-left">
          <img src={`${publicUrl}/top-left.png`} alt="" height="100%" width="100%" />
        </div>
        <div className="top-left-ball">
          <img src={`${publicUrl}/top-left-ball.png`} alt="" height="100%" width="100%" />
        </div>
        <div className="top-left-ball2">
          <img src={`${publicUrl}/top-left-ball2.png`} alt="" height="100%" width="100%" />
        </div>
        <div className="bottom-left">
          <img src={`${publicUrl}/bottom-left.png`} alt="" height="100%" width="100%" />
        </div>
        <div className="bottom-left-ball">
          <img src={`${publicUrl}/bottom-left-ball.png`} alt="" height="100%" width="100%" />
        </div>
        <div className="bottom-left-ball2">
          <img src={`${publicUrl}/bottom-left-ball2.png`} alt="" height="100%" width="100%" />
        </div>
      </div>

      {/* LAYER 2: Content — conditionally scrollable or static */}
      <div className={`content-layer ${isScrollable ? 'page-scrollable' : 'page-static'}`}>
        <div className="logo">
          <img src={`${publicUrl}/new logo.png`} alt="/" height="100%" width="100%" />
        </div>
        <h1>The Turing Test'26</h1>
        <Routes>
          <Route path="/" element={<Input handleevent={handleevent} />} />
          <Route path="/Verify" element={<Verification useremail={useremail} />} />
          <Route path="/finalpage" element={<Finalpage />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
}

function App() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}>
      {/* FIX 3: Route base directory explicitly configured */}
      <Router basename="/">
        <AppContent />
      </Router>
    </GoogleReCaptchaProvider>
  );
}

export default App;
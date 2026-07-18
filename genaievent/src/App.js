
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

  // Form page (/) = scrollable; OTP & Final pages = static (locked to viewport)
  const isScrollable = location.pathname === '/';

  return (
    <>
      {/* LAYER 1: Fixed background — gradient + decorative balls */}
      <div className="bg-layer">
        <div className="top-right">
          <img src="./top-right.png" alt="" height="100%" width="100%" />
        </div>
        <div className="bottom-right">
          <img src="./bottom-right.png" alt="" height="100%" width="100%" />
        </div>
        <div className="top-left">
          <img src="./top-left.png" alt="" height="100%" width="100%" />
        </div>
        <div className="top-left-ball">
          <img src="./top-left-ball.png" alt="" height="100%" width="100%" />
        </div>
        <div className="top-left-ball2">
          <img src="./top-left-ball2.png" alt="" height="100%" width="100%" />
        </div>
        <div className="bottom-left">
          <img src="./bottom-left.png" alt="" height="100%" width="100%" />
        </div>
        <div className="bottom-left-ball">
          <img src="./bottom-left-ball.png" alt="" height="100%" width="100%" />
        </div>
        <div className="bottom-left-ball2">
          <img src="./bottom-left-ball2.png" alt="" height="100%" width="100%" />
        </div>
      </div>

      {/* LAYER 2: Content — conditionally scrollable or static */}
      <div className={`content-layer ${isScrollable ? 'page-scrollable' : 'page-static'}`}>
        <div className="logo">
          <img src="./new logo.png" alt="/" height="100%" width="100%" />
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
      <Router>
        <AppContent />
      </Router>
    </GoogleReCaptchaProvider>
  );
}

export default App;

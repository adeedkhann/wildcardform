import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Verification = ({ useremail }) => {
  const [otp, setOtp] = useState(Array(4).fill(""));
  const [timer, setTimer] = useState(60); // 60 seconds ka timer state
  const [canResend, setCanResend] = useState(false); // Resend button controller

  // Timer run karne ke liye useEffect hook
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else {
      setCanResend(true); // Jab timer 0 ho jaye, tab resend allow karein
      clearInterval(interval);
    }
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [timer]);

  const handleChange = (value, index) => {
    if (/^[A-Za-z0-9]?$/.test(value)) { 
      const newOtp = [...otp];
      newOtp[index] = value.toUpperCase(); 
      setOtp(newOtp);

      if (value && index < 3) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        document.getElementById(`otp-input-${index - 1}`).focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const enteredOtp = otp.join("");
      if (enteredOtp.length < 4) {
        toast.warning("Please enter all 4 digits.");
        return;
      }
      
      await axios.post(
        "http://localhost:5000/api/v1/student/verify",
        { otp: enteredOtp },
        { withCredentials: true }
      );
      toast.success("OTP Verified Successfully!");
      setOtp(new Array(4).fill(""));
    } catch (error) {
      console.error("Error Response:", error.response?.data || error.message);
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const handleResend = async () => {
    if (!canResend) return; // Agar timer chal raha hai toh execute mat hone do

    try {
      await axios.get("http://localhost:5000/api/v1/student/resend-otp", { withCredentials: true });
      toast.info("OTP Resent!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      
      // Resend hone ke baad timer ko dubara 60s par reset karo
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      console.log(error.message);
      toast.error("OTP not sent", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
  };

  return (
    <div className="verification">
      <ToastContainer />
      <div className="verihead">Verification Code</div>
      <div className="para">
        We have sent a verification code to your college id <span>{useremail}</span>✏
      </div>
      <div className="otp">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            type="text"
            className="no"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      
      <button className="submitbtn" onClick={handleSubmit}>
        SUBMIT
      </button>
     
      {/* Timer text conditionally render hoga aur disabled status ke liye class lag jayegi */}
      <div 
        className={`resend ${!canResend ? "disabled-resend" : ""}`} 
        onClick={handleResend}
        style={{ cursor: canResend ? 'pointer' : 'not-allowed' }}
      >
        {canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
      </div>
    </div>
  );
};

export default Verification;
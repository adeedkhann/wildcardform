import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Verification = ({ useremail }) => {
  const navigate = useNavigate();
  const hasEmail = Boolean(useremail && String(useremail).trim());
  const [otp, setOtp] = useState(Array(4).fill(""));
  const [timer, setTimer] = useState(30); // 30 seconds ka timer state
  const [canResend, setCanResend] = useState(false); // Resend button controller
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

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
    if (isVerifying) return;
    if (!hasEmail) {
      toast.error("Email not found. Please register again.");
      return;
    }

    try {
      const enteredOtp = otp.join("");
      if (enteredOtp.length < 4) {
        toast.warning("Please enter all 4 digits.");
        return;
      }

      setIsVerifying(true);
      
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/student/verify`,
        { otp: enteredOtp },
        { withCredentials: true }
      );
      toast.success("OTP Verified Successfully!");
      setOtp(new Array(4).fill(""));
      setTimeout(() => {
        navigate("/finalpage");
      }, 1500);
    } catch (error) {
      console.error("Error Response:", error.response?.data || error.message);
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return; // Agar timer chal raha hai ya resend request pending hai toh execute mat hone do

    try {
      setIsResending(true);
      await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/v1/student/resend-otp`, { withCredentials: true });
      toast.info("OTP Resent!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      
      // Resend hone ke baad timer ko dubara 30s par reset karo
      setTimer(30);
      setCanResend(false);
    } catch (error) {
      console.log(error.message);
      toast.error("OTP not sent", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verification">
      <ToastContainer />
      <div className="verihead">Verification Code</div>
      <div className="para">
        We have sent a verification code to your college id <span>{useremail}</span>
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
      
      <button className="submitbtn" onClick={handleSubmit} disabled={isVerifying || !hasEmail}>
        {isVerifying ? "Submitting..." : "SUBMIT"}
      </button>
     
      {/* Timer text conditionally render hoga aur disabled status ke liye class lag jayegi */}
      <button
        type="button"
        className={`resend ${!canResend ? "disabled-resend" : ""}`} 
        onClick={handleResend}
        disabled={!canResend || isResending}
      >
        {isResending ? "Resending..." : canResend ? "Resend OTP" : `Resend OTP in ${timer}s`}
      </button>
    </div>
  );
};

export default Verification;
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReCAPTCHA from 'react-google-recaptcha';

const Input = ({ handleevent }) => {
  const [link, setLink] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [univRoll, setUnivRoll] = useState('');
  const [gender, setGender] = useState('');
  const [scholarType, setScholarType] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [captchaSize, setCaptchaSize] = useState('');
  const [domain, setDomain] = useState("");
  const containerRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState('');

  const handleCaptcha = async (token) => {
    setCaptchaToken(token);
    try {
      await axios.post("http://turing.mlcoe.tech/api/v1/student/validate", { recaptchaValue: token }, { withCredentials: true });
    } catch (err) {
      console.error("Captcha verification failed:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    if (containerWidth < 450) {
      setCaptchaSize("compact");
    } else {
      setCaptchaSize("normal");
    }
  }, []);

  const regexPatterns = {
    name: /^[A-Za-z\s]{3,30}$/,
    branch: /^[A-Za-z\s]+$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    mobile: /^[0-9]{10}$/,
    studentNumber: /^[0-9]{5,7}$/,
    // Naya University Roll Number regex (starts with 25, digits only, length 10 to 15)
    univRoll: /^25[0-9]{8,13}$/, 
    github: /^(https?:\/\/)?(www\.)?github\.com\/.+/i,
    figma: /^(https?:\/\/)?(www\.)?figma\.com\/.+/i
  };

  const validateField = (field, value) => {
    // 1. Pehle generic regex patterns check karein
    const pattern = regexPatterns[field];
    if (pattern && !pattern.test(value)) {
      if (field === "univRoll") {
        setErrors((prev) => ({ ...prev, univRoll: "Roll number must start with 25 and be 10-15 digits long" }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: `Invalid ${field}` }));
      }
      return;
    }

    // 2. Student Number Custom Validation
    if (field === "studentNumber" && !(value.startsWith("25"))) {
      setErrors((prev) => ({ ...prev, studentNumber: "Student number must start with 25" }));
      return;
    }

    // 3. Link Custom Regex Validation (GitHub / Figma)
    if (field === "link") {
      if (!value) {
        setErrors((prev) => ({ ...prev, link: "Link is required" }));
        return;
      }
      
      if (domain === "Designer") {
        if (!regexPatterns.figma.test(value)) {
          setErrors((prev) => ({ ...prev, link: "Invalid Figma Link (Must start with figma.com)" }));
          return;
        }
      } else if (domain === "Web Developer" || domain === "Machine Learning") {
        if (!regexPatterns.github.test(value)) {
          setErrors((prev) => ({ ...prev, link: "Invalid GitHub Link (Must start with github.com)" }));
          return;
        }
      }
    }

    // Agar koi error nahi hai, toh specific field ka error remove karein
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });

    // 4. Email aur Student Number match validation
    if ((field === "email" || field === "studentNumber") && email && studentNumber) {
      const emailMatch = email.match(/\d+/g);
      const numberInEmail = emailMatch ? emailMatch.join('') : '';
      if (!email.includes(studentNumber) || !numberInEmail.includes(studentNumber)) {
        setErrors((prev) => ({
          ...prev,
          email: "Student number does not match with email ID",
        }));
      } else {
        setErrors((prev) => {
          const { email: _, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();

    // Required fields check
    if (
      !name || !branch || !univRoll || !gender || !scholarType ||
      !studentNumber || !email || !mobile || !domain || !link
    ) {
      toast.error("Please fill all the required fields.");
      return;
    }

    // Final check for Roll Number before submitting
    if (!regexPatterns.univRoll.test(univRoll)) {
      toast.error("Please enter a valid University Roll Number.");
      return;
    }

    if (!email.includes(studentNumber)) {
      toast.error("Student number must match the number in email ID.");
      return;
    }

    // Submit ke time final link verification (Extra Safety)
    if (domain === "Designer" && !regexPatterns.figma.test(link)) {
      toast.error("Please enter a valid Figma link.");
      return;
    }
    if ((domain === "Web Developer" || domain === "Machine Learning") && !regexPatterns.github.test(link)) {
      toast.error("Please enter a valid GitHub link.");
      return;
    }

    handleevent(email);

    // Final check before hitting API
    if (Object.keys(errors).length === 0) {
      const formData = {
        fullName: name,
        branch: branch,
        link: link,
        rollNumber: univRoll,
        gender: gender,
        scholar: scholarType,
        studentNumber: studentNumber,
        studentEmail: email,
        mobileNumber: mobile,
        domain: domain
      };
      try {
        await axios.post(`http://turing.mlcoe.tech/api/v1/student/register`,
          formData,
          { withCredentials: true }
        );
        toast.success("Form submitted successfully! 🎉");
        navigate("/Verify");
        setName('');
        setBranch('');
        setUnivRoll('');
        setGender('');
        setScholarType('');
        setStudentNumber('');
        setEmail('');
        setMobile('');
        setDomain('');
        setLink('');
      } catch (err) {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="inputcontainer">
      <form>
        <div className="input">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={(e) => validateField("name", e.target.value)}
            required
          />
          {errors.name && <small className="error">{errors.name}</small>}
        </div>

        <div className="input">
          <label htmlFor="branch">Branch</label>
          <select
            id="branch"
            name="branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            onBlur={(e) => validateField("branch", e.target.value)}
            required
          >
            <option value="" disabled>Select Branch</option>
            <option value="CSIT">CSIT</option>
            <option value="CSE">CSE</option>
            <option value="CSE(AIML)">CSE(AIML)</option>
            <option value="CSE(DS)">CSE(DS)</option>
            <option value="CSE(HINDI)">CSE(HINDI)</option>
            <option value="IT">IT</option>
            <option value="EN">EN</option>
            <option value="CIVIL">CIVIL</option>
            <option value="MECHANICAL">MECHANICAL</option>
            <option value="AIML">AIML</option>
            <option value="ECE">ECE</option>
            <option value="CS">CS</option>
          </select>
          {errors.branch && <small className="error">{errors.branch}</small>}
        </div>

        <div className="input">
          <label htmlFor="domain">Domain</label>
          <select
            id="domain"
            name="domain"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              setLink(""); 
              setErrors((prev) => {
                const { link: _, ...rest } = prev;
                return rest; 
              });
            }}
            onBlur={(e) => validateField("domain", e.target.value)}
            required
          >
            <option value="" disabled>Select Domain</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Web Developer">Web Developer</option>
            <option value="Designer">Designer</option>
          </select>
          {errors.domain && <small className="error">{errors.domain}</small>}
        </div>

        {domain && (
          <div className="input">
            <label htmlFor="link">
              {domain === "Designer" ? "Figma Link" : "GitHub Link"}
            </label>
            <input
              type="url"
              id="link"
              name="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onBlur={(e) => validateField("link", e.target.value)}
              required
            />
            {errors.link && <small className="error">{errors.link}</small>}
          </div>
        )}

        <div className="input">
          <label htmlFor="univRoll">University Roll No.</label>
          <input
            type="text"
            id="univRoll"
            name="univRoll"
            value={univRoll}
            onChange={(e) => setUnivRoll(e.target.value)}
            onBlur={(e) => validateField("univRoll", e.target.value)}
            required
          />
          {errors.univRoll && <small className="error">{errors.univRoll}</small>}
        </div>

        <div className="input1">
          <div className="gender">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="" disabled>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="scholar">
            <label htmlFor="scholar-type">Scholar</label>
            <select
              name="scholarType"
              value={scholarType}
              onChange={(e) => setScholarType(e.target.value)}
              required
            >
              <option value="" disabled>Select Scholar Type</option>
              <option value="day">Day Scholar</option>
              <option value="hostel">Hosteller</option>
            </select>
          </div>
        </div>

        <div className="input">
          <label htmlFor="student-number">Student Number</label>
          <input
            type="tel"
            name="studentNumber"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            onBlur={(e) => validateField("studentNumber", e.target.value)}
            required
          />
          {errors.studentNumber && (
            <small className="error">{errors.studentNumber}</small>
          )}
        </div>

        <div className="input">
          <label htmlFor="email">College Email Id</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => validateField("email", e.target.value)}
            required
          />
          {errors.email && <small className="error">{errors.email}</small>}
        </div>

        <div className="input">
          <label htmlFor="mobile">Mobile No</label>
          <input
            type="tel"
            name="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            onBlur={(e) => validateField("mobile", e.target.value)}
            required
          />
          {errors.mobile && <small className="error">{errors.mobile}</small>}
        </div>

        <div className="handleCaptcha" ref={containerRef}>
          <ReCAPTCHA
            sitekey="6LfZSKgrAAAAAC4TqAYwouSIUC1ACsattTPVy22f"
            onChange={handleCaptcha}
            size={captchaSize}
          />
        </div>

        <button
          onClick={handleClick}
          type="submit"
          className="verifybtn input"
          disabled={Object.keys(errors).length > 0}
        >
          Verify
        </button>
      </form>
    </div>
  );
};

export default Input;
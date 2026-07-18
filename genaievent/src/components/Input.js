import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const Input = ({ handleevent }) => {
  const [link, setLink] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [univRoll, setUnivRoll] = useState("");
  const [gender, setGender] = useState("");
  const [scholarType, setScholarType] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [domain, setDomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // reCAPTCHA v3 hook — runs invisibly in the background
  const { executeRecaptcha } = useGoogleReCaptcha();

  const regexPatterns = {
    name: /^(?=.{3,30}$)[A-Za-z]+(?: [A-Za-z]+)*$/,
    branch: /^[A-Za-z\s()]+$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    mobile: /^\d{10}$/,
    studentNumber: /^\d{7,8}$/,
    univRoll: /^\d{13}$/,
    github: /^(https?:\/\/)?(www\.)?github\.com\/.+/i,
    figma: /^(https?:\/\/)?(www\.)?figma\.com\/.+/i,
  };

  const validateField = (field, value) => {
    // 1. Pehle generic regex patterns check karein
    const pattern = regexPatterns[field];
    if (pattern && !pattern.test(value)) {
      if (field === "univRoll") {
        setErrors((prev) => ({
          ...prev,
          univRoll: "Roll number must be exactly 13 digits",
        }));
      } else if (field === "studentNumber") {
        setErrors((prev) => ({
          ...prev,
          studentNumber: "Student number must be 7 to 8 digits",
        }));
      } else if (field === "name") {
        setErrors((prev) => ({
          ...prev,
          name: "Name can contain only letters with single spaces between words",
        }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: `Invalid ${field}` }));
      }
      return;
    }

    // 3. Link Custom Regex Validation (GitHub / Figma)
    if (field === "link") {
      if (!value) {
        setErrors((prev) => ({ ...prev, link: "Link is required" }));
        return;
      }

      if (domain === "designer") {
        if (!regexPatterns.figma.test(value)) {
          setErrors((prev) => ({
            ...prev,
            link: "Invalid Figma Link (Must start with figma.com)",
          }));
          return;
        }
      } else if (domain === "web-developer" || domain === "machine-learning") {
        if (!regexPatterns.github.test(value)) {
          setErrors((prev) => ({
            ...prev,
            link: "Invalid GitHub Link (Must start with github.com)",
          }));
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
    if (
      (field === "email" || field === "studentNumber") &&
      email &&
      studentNumber
    ) {
      const emailMatch = email.match(/\d+/g);
      const numberInEmail = emailMatch ? emailMatch.join("") : "";
      if (
        !email.includes(studentNumber) ||
        !numberInEmail.includes(studentNumber)
      ) {
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

    if (isSubmitting) return;

    // Required fields check
    if (
      !name ||
      !branch ||
      !univRoll ||
      !gender ||
      !scholarType ||
      !studentNumber ||
      !email ||
      !mobile ||
      !domain ||
      !link
    ) {
      toast.error("Please fill all the required fields.");
      return;
    }

    // reCAPTCHA v3 — get token before submitting
    if (!executeRecaptcha) {
      toast.error("reCAPTCHA not ready. Please wait a moment.");
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
    if (domain === "designer" && !regexPatterns.figma.test(link)) {
      toast.error("Please enter a valid Figma link.");
      return;
    }
    if (
      (domain === "web-developer" || domain === "machine-learning") &&
      !regexPatterns.github.test(link)
    ) {
      toast.error("Please enter a valid GitHub link.");
      return;
    }

    // Final check before hitting API
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted errors first.");
      return;
    }

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
      domain: domain,
      recaptchaValue: null,
    };

    setIsSubmitting(true);
    try {
      const recaptchaToken = await executeRecaptcha("register");

      if (!recaptchaToken) {
        toast.error("reCAPTCHA failed to load. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Bundle the updated object safely
      const completeFormData = {
        fullName: name,
        branch: branch,
        link: link,
        rollNumber: univRoll,
        gender: gender,
        scholar: scholarType,
        studentNumber: studentNumber,
        studentEmail: email,
        mobileNumber: mobile,
        domain: domain,
        recaptchaValue: recaptchaToken, // Build cleanly with the token included
      };

      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/v1/student/register`,
        completeFormData,
        { withCredentials: true },
      );

      handleevent(email);
      toast.success("OTP Sent successfully! 🎉");
      navigate("/Verify");
      setName("");
      setBranch("");
      setUnivRoll("");
      setGender("");
      setScholarType("");
      setStudentNumber("");
      setEmail("");
      setMobile("");
      setDomain("");
      setLink("");
    } catch (err) {
      // Show the actual error message from the backend
      const errorMsg =
        err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMsg);
      console.log(err);
    } finally {
      setIsSubmitting(false);
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
            onChange={(e) => {
              const sanitizedName = e.target.value
                .replace(/[^A-Za-z\s]/g, "")
                .replace(/\s{2,}/g, " ")
                .replace(/^\s+/g, "");
              setName(sanitizedName);
            }}
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
            <option value="" disabled>
              Select Branch
            </option>
            <option value="CSIT">CSIT</option>
            <option value="CSE">CSE</option>
            <option value="CSE(AI&ML)">CSE(AI&ML)</option>
            <option value="CSE(DS)">CSE(DS)</option>
            <option value="CS(H)">CS(Hindi)</option>
            <option value="IT">IT</option>
            <option value="EN">EN</option>
            <option value="Civil">Civil</option>
            <option value="ME">Mechanical</option>
            <option value="AIML">AIML</option>
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
            <option value="" disabled>
              Select Domain
            </option>
            <option value="machine-learning">Machine Learning</option>
            <option value="web-developer">Web Developer</option>
            <option value="designer">Designer</option>
          </select>
          {errors.domain && <small className="error">{errors.domain}</small>}
        </div>

        {domain && (
          <div className="input">
            <label htmlFor="link">
              {domain === "designer" ? "Figma Link" : "GitHub Link"}
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
            inputMode="numeric"
            maxLength={13}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 13);
              setUnivRoll(digitsOnly);
            }}
            onBlur={(e) => validateField("univRoll", e.target.value)}
            required
          />
          {errors.univRoll && (
            <small className="error">{errors.univRoll}</small>
          )}
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
              <option value="" disabled>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
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
              <option value="" disabled>
                Select Scholar Type
              </option>
              <option value="DayScholar">Day Scholar</option>
              <option value="Hostler">Hosteller</option>
            </select>
          </div>
        </div>

        <div className="input">
          <label htmlFor="student-number">Student Number</label>
          <input
            type="tel"
            name="studentNumber"
            value={studentNumber}
            inputMode="numeric"
            minLength={7}
            maxLength={8}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 8);
              setStudentNumber(digitsOnly);
            }}
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
            inputMode="numeric"
            minLength={10}
            maxLength={10}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
              setMobile(digitsOnly);
            }}
            onBlur={(e) => validateField("mobile", e.target.value)}
            required
          />
          {errors.mobile && <small className="error">{errors.mobile}</small>}
        </div>

        <button
          onClick={handleClick}
          type="submit"
          className="verifybtn input"
          disabled={Object.keys(errors).length > 0 || isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
};

export default Input;

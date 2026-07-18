import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { Student } from "../models/studentModel.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
import session from "express-session";
import axios from "axios";


async function sendOtp(email, otp) {
    try {
        await resend.emails.send({
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "[The Turing Test 2025] Your One-Time Password (OTP)",
            text: `Hello,

Your One-Time Password (OTP) for completing registration for The Turing Test 2025 is:

OTP: ${otp}

This code will expire in 3 minutes.

Please do not share it with anyone.

Best regards,
MLCOE Team`
        });

        console.log(`OTP sent to ${email}`);
        return true;
    } catch (error) {
        console.error("Resend Error:", error);
        return false;
    }
}


function generateOtp() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  const randomLetter = () =>
    letters.charAt(Math.floor(Math.random() * letters.length));
  const randomNumber = () =>
    numbers.charAt(Math.floor(Math.random() * numbers.length));

  // 2 letters + 2 numbers
  let otp = randomLetter() + randomLetter() + randomNumber() + randomNumber();

  return otp;
}
async function sendConfirmation(email) {
    try {
        await resend.emails.send({
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "[The Turing Test 2025] Registration Confirmed ✅",
            text: `Hello,

Congratulations! 🎉

Your registration for The Turing Test 2025 has been successfully confirmed.

We are excited to have you on board.

Best regards,
MLCOE Team`
        });

        console.log(`Confirmation sent to ${email}`);
        return true;
    } catch (error) {
        console.error("Resend Error:", error);
        return false;
    }
}

const registerStudent = asyncHandler(async (req, res) => {
    const {
    fullName,
    studentNumber,
    gender,
    rollNumber,
    mobileNumber,
    studentEmail,
    branch,
    scholar,
    domain,
    link
} = req.body;
    const userIp = req.headers['x-forwarded-for'] || req.ip;

    const registrationCount = await Student.countDocuments({ ip: userIp });
    if (registrationCount >= 10) {
        throw new ApiError(400, "Registration limit reached for this device.");
    }

    if (!studentEmail.endsWith('@akgec.ac.in')) {
        throw new ApiError(400, "Must Enter College Email Id Only");
    }

    if (!studentNumber.startsWith("25")) {
    throw new ApiError(401, "Unauthorized student Number");
}

    const existingStudent = await Student.findOne({
        $or: [{ studentEmail }, { studentNumber }, { rollNumber }],
    });

    if (mobileNumber.length !== 10 || isNaN(Number(mobileNumber))) {
        throw new ApiError(400, "Mobile Number is invalid");
    }

    if (existingStudent) {
        throw new ApiError(
            409,
            "Student with that university roll number or student number is already registered"
        );
    }

    // Generate OTP
    const otp = generateOtp();
    const otpExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes
       console.log("========== GENERATED OTP ==========");
console.log(otp);
console.log("==================================");

    // Store OTP in session
    req.session.otp = otp;
    req.session.otpExpiry = otpExpiry;
    req.session.userData = {
    fullName,
    studentNumber,
    gender,
    mobileNumber,
    studentEmail,
    branch,
    scholar,
    rollNumber,
    domain,
   link,
    ip: userIp,
    otpExpiry
};

    const otpSent = await sendOtp(studentEmail, otp);
    if (!otpSent) {
        throw new ApiError(500, "Failed to send OTP. Please try again.");
    }


    res.status(200).json(new ApiResponse(200, { studentEmail }, "OTP sent successfully. Please verify your email."));
});

const verifyStudentRegistration = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    // Validate OTP
    if (!req.session.otp) {
        throw new ApiError(400, "OTP not found in session. Please restart registration.");
    }

    if (String(otp) !== String(req.session.otp)) {
        throw new ApiError(401, "Invalid OTP");
    }

    if (req.session.otpExpiry < Date.now()) {
        req.session.otp = null;
        req.session.otpExpiry = null;
        req.session.userData = null;
        throw new ApiError(400, "OTP expired. Please restart registration.");
    }

    const email = req.session.userData.studentEmail;

    const existingStudent = await Student.findOne({
        $or: [
            { studentEmail: req.session.userData.studentEmail },
            { studentNumber: req.session.userData.studentNumber },
            { rollNumber: req.session.userData.rollNumber },
        ],
    });

    if (existingStudent) {
        throw new ApiError(
            409,
            "Student with that university roll number or student number is already registered"
        );
    }

    let newStudent;
    try {
        newStudent = await Student.create(req.session.userData);
    } catch (error) {
        // Handle DB-level unique index conflicts (race conditions / concurrent requests)
        if (error?.code === 11000) {
            throw new ApiError(
                409,
                "Student with that university roll number or student number is already registered"
            );
        }
        throw error;
    }

    if (!newStudent) {
        throw new ApiError(500, "Failed to create student. Please try again.");
    }

        const confSEnt = await sendConfirmation(email);
    if (!confSEnt) {
        throw new ApiError(500, "Failed to send OTP. Please try again.");
    }

    // Clear session after successful registration
    req.session.otp = null;
    req.session.otpExpiry = null;
    req.session.userData = null;

    res.status(201).json(
        new ApiResponse(201, { student: newStudent }, "Student registered and verified successfully.")
    );
});


const verifyCaptcha = async (req, res) => {
    const { recaptchaValue } = req.body;

    if (!recaptchaValue) {
        return res.status(400).json({ message: 'reCAPTCHA value is missing' });
    }

    try {
        const { data } = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: recaptchaValue,
                },
            }
        );

        if (data.success) {
            return res.status(200).json({ message: 'reCAPTCHA verified successfully' });
        } else {
            return res.status(400).json({ message: 'reCAPTCHA verification failed' });
        }
    } catch (error) {
        console.error('reCAPTCHA error:', error);
        return res.status(500).json({ message: 'reCAPTCHA verification error' });
    }
};

const resendOTP = asyncHandler(async (req, res) => {
    if (!req.session.userData) {
        throw new ApiError(400, "User data not found in session. Please start registration again.");
    }

    const { studentEmail } = req.session.userData;
    const newOtp = generateOtp();

    const otpExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes
    req.session.otp = newOtp;
    req.session.otpExpiry = otpExpiry;
    req.session.userData.otpExpiry = otpExpiry; // update otpExpiry

    const otpSent = await sendOtp(studentEmail, newOtp);
    if (!otpSent) {
        throw new ApiError(500, "Failed to send OTP. Please try again.");
    }

    res.status(200).json(new ApiResponse(200, { studentEmail }, "OTP resent successfully."));
});


export { registerStudent, verifyStudentRegistration,verifyCaptcha,resendOTP };
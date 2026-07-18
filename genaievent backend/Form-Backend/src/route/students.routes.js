import { Router } from "express";
// const { registerStudent, verifyStudentRegistration } = require("../controller/student.controller");

import { registerStudent, resendOTP, verifyCaptcha, verifyStudentRegistration } from "../controller/student.controller.js";

const router=Router();

router.route("/register").post(registerStudent);

router.route("/verify").post(verifyStudentRegistration);

router.route("/validate").post(verifyCaptcha);

router.route("/resend-otp").get(resendOTP);

export default router
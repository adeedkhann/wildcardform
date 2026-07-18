import { Router } from "express";
// const { registerStudent, verifyStudentRegistration } = require("../controller/student.controller");
import { validateStudent } from "../middlewares/validateStudent.js";
import { registerLimiter } from "../middlewares/rateLimiter.js";

import {
  registerStudent,
  resendOTP,
  verifyCaptcha,
  verifyStudentRegistration,
} from "../controller/student.controller.js";

const router = Router();

router
  .route("/register")
  .post(registerLimiter, validateStudent, registerStudent);

router.route("/verify").post(verifyStudentRegistration);

router.route("/validate").post(verifyCaptcha);

router.route("/resend-otp").get(resendOTP);

export default router;

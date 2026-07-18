import { studentValidationSchema } from "../validations/validation.js";

export const validateStudent = (req, res, next) => {
  const { error, value } = studentValidationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((err) => err.message),
    });
  }

  // Ensure email is in the format: name2510087@akgec.ac.in
  const emailPattern = /^[a-zA-Z0-9._%+-]*25\d{5,8}@akgec\.ac\.in$/;

if (!emailPattern.test(value.studentEmail)) {
  return res.status(400).json({
    success: false,
    message:
      "Please enter a valid AKGEC email address in the format name2510087@akgec.ac.in.",
  });
}

  // Extract the student number from the email
  const studentNoInEmail =
  value.studentEmail.match(/25\d{5,8}(?=@)/)?.[0];

if (studentNoInEmail !== value.studentNumber) {
  return res.status(400).json({
    success: false,
    message:
      "Student number in the email must match the provided student number.",
  });
}

  req.body = value;
  next();
};
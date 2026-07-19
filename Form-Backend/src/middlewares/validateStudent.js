import { studentValidationSchema } from "../validations/validation.js";

export const validateStudent = (req, res, next) => {
  const { error, value } = studentValidationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((err) => err.message);
    console.log("Sending Validation Error to Frontend:", errorMessages);
    return res.status(400).json({
      success: false,
      errors: errorMessages,
    });
  }

  // Ensure email is in the format: name2510087@akgec.ac.in
  const emailPattern = /^[a-zA-Z0-9._%+-]*25\d{5,8}@akgec\.ac\.in$/;

if (!emailPattern.test(value.studentEmail)) {
  const errMsg = "Please enter a valid AKGEC email address in the format name2510087@akgec.ac.in.";
  console.log("Sending Validation Error to Frontend:", errMsg);
  return res.status(400).json({
    success: false,
    message: errMsg,
  });
}

  // Extract the student number from the email
  const studentNoInEmail =
  value.studentEmail.match(/25\d{5,8}(?=@)/)?.[0];

if (studentNoInEmail !== value.studentNumber) {
  const errMsg = "Student number in the email must match the provided student number.";
  console.log("Sending Validation Error to Frontend:", errMsg);
  return res.status(400).json({
    success: false,
    message: errMsg,
  });
}

  req.body = value;
  next();
};
import Joi from "joi";

export const studentValidationSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.empty": "Full name is required.",
      "string.min": "Full name must be at least 2 characters long.",
      "string.max": "Full name cannot exceed 50 characters.",
      "string.pattern.base":
        "Full name can contain only letters and spaces.",
      "any.required": "Full name is required.",
    }),

  studentNumber: Joi.string()
  .trim()
  .required()
  .custom((value, helpers) => {
    if (!value.startsWith("25")) {
      return helpers.message("Student number must start with 25.");
    }
    if (!/^25\d{5,8}$/.test(value)) {
      return helpers.message("Student number must start with 25 and be between 7 and 10 digits long.");
    }
    return value;
  })
  .messages({
    "string.empty": "Student number is required.",
    "any.required": "Student number is required.",
  }),

 studentEmail: Joi.string()
  .trim()
  .lowercase()
  .pattern(/^[a-zA-Z0-9._%+-]*25\d{5,8}@akgec\.ac\.in$/)
  .required()
  .messages({
    "string.empty": "Student email is required.",
    "string.pattern.base":
      "Email must be in the format name2510087@akgec.ac.in.",
    "any.required": "Student email is required.",
  }),

  gender: Joi.string()
    .valid("male", "female")
    .required()
    .messages({
      "any.only": "Gender must be either male or female.",
      "any.required": "Gender is required.",
    }),

  branch: Joi.string()
    .valid(
      "CSE",
      "CSE(AI&ML)",
      "AIML",
      "CSE(DS)",
      "CS",
      "CS(H)",
      "CSIT",
      "IT",
      "EN",
      "ECE",
      "ME",
      "Civil"
    )
    .required()
    .messages({
      "any.only": "Please select a valid branch.",
      "any.required": "Branch is required.",
    }),

  mobileNumber: Joi.string()
    .trim()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Mobile number must be a valid 10-digit Indian mobile number.",
      "any.required": "Mobile number is required.",
    }),

  rollNumber: Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
      if (!value.startsWith("25")) {
        return helpers.message("Roll number must start with 25.");
      }
      if (!/^25\d{11}$/.test(value)) {
        return helpers.message("Roll number must start with 25 and contain exactly 13 digits.");
      }
      return value;
    })
    .messages({
      "string.empty": "Roll number is required.",
      "any.required": "Roll number is required.",
    }),

  scholar: Joi.string()
    .valid("DayScholar", "Hostler")
    .required()
    .messages({
      "any.only":
        "Scholar must be either DayScholar or Hostler.",
      "any.required": "Scholar is required.",
    }),

  domain: Joi.string()
    .valid(
      "designer",
      "web-developer",
      "machine-learning"
    )
    .required()
    .messages({
      "any.only":
        "Domain must be one of: designer, web-developer, machine-learning.",
      "any.required": "Domain is required.",
    }),

  link: Joi.string()
    .trim()
    .allow("")
    .pattern(
      /^(https?:\/\/)?(www\.)?(github\.com|figma\.com|canva\.com)\/.+$/i
    )
    .messages({
      "string.pattern.base":
        "Link must be a valid GitHub, Figma, or Canva URL.",
    }),
    recaptchaValue: Joi.string()
    .required()
    .messages({
      "string.empty": "reCAPTCHA validation token is required.",
      "any.required": "reCAPTCHA token is missing."
    })
});
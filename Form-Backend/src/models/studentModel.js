import mongoose, { Schema } from "mongoose";

const studentSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "full name is required"],
      index: true,
      trim: true,
    },

    studentNumber: {
      type: String,
      required: [true, "Student Number is required"],
      unique: true,
      trim: true,
    },

    rollNumber: {
      type: String,
      required: [true, "Roll Number is required"],
      unique: true,
      trim: true,
    },

    gender: {
      type: String,
      required: [true, "gender is required"],
    },

    mobileNumber: {
      type: String,
      required: [true, "mobile number is required"],
      unique: true,
    },

    studentEmail: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    branch: {
      type: String,
      required: [true, "branch is required"],
    },

    scholar: {
      type: String,
      required: [true, "residence is required"],
    },

    domain: {
      type: String,
      required: [true, "Domain is required"],
    },

    // Portfolio Links
   link: {
  type: String,
  trim: true,
  default: "",
  validate: {
    validator: function (value) {
      if (!value) return true; // allow empty
      return /^(https?:\/\/)?(www\.)?(github\.com|figma\.com|canva\.com)\/.+$/i.test(value);
    },
    message: "Link must be a valid GitHub, Figma, or Canva URL.",
  },
},

    ip: {
      type: String,
    },
  },
  { timestamps: true }
);

// Explicit unique indexes for core identity fields.
studentSchema.index({ rollNumber: 1 }, { unique: true });
studentSchema.index({ studentNumber: 1 }, { unique: true });
studentSchema.index({ studentEmail: 1 }, { unique: true });

export const Student = mongoose.model("Student", studentSchema);
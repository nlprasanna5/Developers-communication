const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      validate(value){
         if(!validator.isStrongPassword(value)){
            throw new Error("Password is weak")
         }
      },
      // match: [
      //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      //   "Password must contain uppercase, lowercase, number, and special character",
      // ],
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender data is not valid");
        }
      },
    },
    photoUrl: {
      type: String,
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid url");
        }
      },
    },
    about: {
      type: String,
      default: "This is aboout of the user",
    },
    skills: {
      type: [String],
      validate(skills) {
        if (skills.length !== new Set(skills).size) {
          throw new Error("Duplicate skills are not allowed");
        }
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("user", userSchema);

module.exports = User;

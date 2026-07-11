const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SECRETKEY = process.env.JWT_SECRET;

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
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is weak");
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
      enum: {
        values: ["male", "female", "others"],
        message: `{VALUE} is not a valid gender type`,
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmfiUPX0HzT9eb2yRuTB1Gyn2WUcl7ubvKa4KSJ2tLrw&s=10",
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
    designation: {
      type: String,
    },
    location: {
      type: String,

    },

    currentCompany: {
      type: String,
    },
    totalExperience: {
      type: Number,
    },
    socialLinks: {
      type: Map,
      of: {
        type: String,
        validate: {
          validator: function (value) {
            return !value || validator.isURL(value);
          },
          message: "Invalid URL",
        },
      },
      default: {},
    },
    experience:{
      type: [{
        company: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
      }],
      default: [],
    },
    projects: {
      type: [{
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        technologies: {
          type: [String],
          required: true,
        },
        link: {
          type: String,
          validate: {
            validator: function (value) {
              return !value || validator.isURL(value);
            },
            message: "Invalid URL",
          },
        },
      }],
      default: [],
    },
    isPremium:{
      type:Boolean,
      default:false,
    },
    membershipType:{
      type:String,
    },
    
  },
  {
    timestamps: true,
  },
);

userSchema.index({ firstName: 1, lastName: 1 });

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, SECRETKEY, {
    expiresIn: "7d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;

  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash,
  );

  return isPasswordValid;
};

const User = mongoose.model("user", userSchema);

module.exports = User;

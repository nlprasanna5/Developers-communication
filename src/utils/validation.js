const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, password, emailId } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is required");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "about",
    "gender",
    "age",
    "skills",
    "photoUrl",
  ];

  const isEditable = Object.keys(req.body).every((key) =>
    allowedEditFields.includes(key),
  );

  return isEditable;

};

module.exports = {
  validateSignUpData,
  validateEditProfileData
};

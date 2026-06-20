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


module.exports = {
    validateSignUpData
}

const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData, validateForgotPasswordData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const calculateProfileStrength = require("../utils/helpers");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

        const strengthDetails =
      calculateProfileStrength(user);

      console.log("strengthDetails",strengthDetails);
      

    // res.status(200).json(user);
    res.status(200).json({data:user,strengthDetails});
  } catch (err) {
    console.log("error", err);
    res.status(400).send("Error: " + err);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }
    // const { userId } = req.query;
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    console.log(loggedInUser);

    await loggedInUser.save();
    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfully`,
      data: loggedInUser,
    });

    // const user = await User.findByIdAndUpdate(userId, loggedInUser, {
    //   runValidators: true,
    //   returnDocument:"after"
    // });
    // console.log("user",user);
  } catch (err) {
    res.status(400).json({
      message:err.message
    });
  }
});

profileRouter.patch("/profile/password", async (req, res) => {
  try {
    const { password, confirmPassword, emailId } = req.body;

    validateForgotPasswordData(req);

    const user = await User.findOne({ emailId: emailId });

    console.log("user", user);

    if (user) {
      user.password = await bcrypt.hash(password, 10);

      await user.save();

      console.log("changed", user);
    } else {
      throw new Error("Email not found");
    }

    res.send("changed password");
  } catch (err) {
    res.status(400).send("Error: " + err);
  }
});

module.exports = profileRouter;

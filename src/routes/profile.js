
const express = require("express");
const { userAuth } = require("../middlewares/auth");

const profileRouter = express.Router();


profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    console.log("error", err);
    res.status(400).send("Error: " + err);
  }
});

module.exports= profileRouter
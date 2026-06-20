
const express = require("express");
const { userAuth } = require("../middlewares/auth");

const requestRouter= express.Router();

requestRouter.post("/sendConnectionRequest", userAuth, (req, res) => {
  try {
    const user = req.user;
    res.send(user.firstName + " send the Request ");
  } catch (err) {
    res.status(400).send("Error" + err.message);
  }
});

module.exports= requestRouter;
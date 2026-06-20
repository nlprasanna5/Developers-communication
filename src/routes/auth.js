
const express= require("express");
const User= require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt")

const authRouter = express.Router();



authRouter.post("/signup", async (req, res) => {
  try {
    // validate the data
    validateSignUpData(req);

    const { firstName, lastName, password, emailId } = req.body;

    // encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    const userDetails = {
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    };

    const user = new User(userDetails);
    await user.save();
    res.send("saved successfully");
  } catch (err) {
    console.log("error", err);

    res.status(400).send("Error: " + err);
  }
});


authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid credentails");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentails");
    } else {
      // create jwt token
     
      const token = await user.getJWT();

      console.log("token", token);

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send("Login Successful!");
    }
  } catch (err) {
    console.log("error", err);
    res.status(400).send("Error: " + err);
  }
});


authRouter.post("/logout",async(req,res) => {
    try{
        res.clearCookie("token");

        res.cookie("token",null,{
            expires: new Date(Date.now())
        })
        res.send("Logout successfully")

    }catch(err){
        res.status(400).send("Error: "+err.message)
    }
})

module.exports=authRouter
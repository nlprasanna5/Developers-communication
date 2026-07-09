const User = require("../models/user");
const jwt = require("jsonwebtoken");

const SECRETKEY = process.env.JWT_SECRET;

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("Please login again");
    }

    const decodedData= await jwt.verify(token,SECRETKEY);

    const {_id}= decodedData;

    const user = await User.findById(_id);

    if(!user){
      throw new Error("User not found")
    }

    req.user= user
    next();

   
  } catch (err) {
    res.status(400).send("Error" + err.message);
  }
};

module.exports = {  userAuth };

const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");

// Get all the pending connection requests for the loggedin user

const USER_SAFE_DATA=[
      "firstName",
      "lastName",
      "about",
      "photoUrl",
      "skills",
      "age",
      "gender",
    ]

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const allRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.status(200).json({
      message: "Success",
      data: allRequests,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionData = await ConnectionRequest.find({
      $or:[
        {fromUserId:loggedInUser._id, status:"accepted" },
        {toUserId:loggedInUser._id, status:"accepted" }
      ]
    }).populate("fromUserId",USER_SAFE_DATA).populate("toUserId",USER_SAFE_DATA)

    const transformedData= connectionData.map((data) => {
      if(data.fromUserId._id.toString() === loggedInUser._id.toString()){
        return data.toUserId
      }else{
        return data.fromUserId
      }
    })

    res.status(200).json({
      data:transformedData
    })




  } catch (err) {
    res.status(400).json({
      message:err.message
    })
  }
});

module.exports = userRouter;

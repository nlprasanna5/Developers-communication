const express = require("express");
const mongoose = require("mongoose");
const { userAuth } = require("../middlewares/auth");

const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      // if(toUserId === fromUserId){
      //   return res.status(400).json({
      //     message:"User is same"
      //   })
      // }

      if (!mongoose.Types.ObjectId.isValid(toUserId)) {
        return res.status(404).json({
          message: "User is not valid",
        });
      }

      const allowedStatus = ["ignored", "interested"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: `Invalid status ${status}`,
        });
      }

      console.log("toUserId", toUserId);

      const toUser = await User.findById(toUserId);

      console.log("toUser", toUser);
      if (!toUser) {
        return res.status(404).json({
          message: "User not found in DB",
        });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          {
            toUserId: fromUserId,
            fromUserId: toUserId,
          },
        ],
      });

      if (existingConnectionRequest) {
        
        res.status(400).json({
          message: "Connection Request already sent",
        });
      }

      console.log("hello");
      

      const connectRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const connectionData = await connectRequest.save();

      res.json({
        message: `${req.user.firstName} is ${status} in ${toUser.firstName}` ,
        connectionData,
      });
    } catch (err) {
      res.status(400).send("Error" + err.message);
    }
  },
);

module.exports = requestRouter;

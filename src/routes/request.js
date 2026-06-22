const express = require("express");
const { userAuth } = require("../middlewares/auth");

const ConnectionRequest = require("../models/connectionRequest");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: `Invalid status ${status}`,
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

      const connectRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const connectionData = await connectRequest.save();

      res.json({
        message: "Connecion Request Sent Successfully",
        connectionData,
      });
    } catch (err) {
      res.status(400).send("Error" + err.message);
    }
  },
);

module.exports = requestRouter;

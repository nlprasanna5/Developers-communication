const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// Get all the pending connection requests for the loggedin user

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "about",
  "photoUrl",
  "skills",
  "age",
  "gender",
];

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
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const transformedData = connectionData.map((data) => {
      if (data.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return data.toUserId;
      } else {
        return data.fromUserId;
      }
    });

    res.status(200).json({
      data: transformedData,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    limit = limit > 50 ? 50 : limit;

    const skipCount = (page - 1) * limit;

    // console.log("users", users);

    const connectionData = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select(["fromUserId", "toUserId"]);

    // console.log("connectionData",connectionData);

    const hideUsersFromFeed = new Set();

    connectionData.forEach((data) => {
      hideUsersFromFeed.add(data.fromUserId.toString());
      hideUsersFromFeed.add(data.toUserId.toString());
    });

    console.log("hideUsersFromFeed", hideUsersFromFeed);

    const feedUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skipCount)
      .limit(limit);

    res.status(200).json({
      data: feedUsers,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

module.exports = userRouter;

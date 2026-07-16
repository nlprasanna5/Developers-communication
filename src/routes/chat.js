const express = require("express");
const Chat = require("../models/chat");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName emailId",
    });

    const targetUser = await User.findById(targetUserId).select(
      "firstName lastName photoUrl",
    );

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    // Latest messages first
    const totalMessages = chat.messages.length;
    const start = Math.max(totalMessages - page * limit, 0);
    console.log("start", start);

    const end = totalMessages - (page - 1) * limit;
    console.log("end", end);

    const paginatedMessages = chat.messages.slice(start, end);

    res.status(200).json({
      targetUser,
      messages: paginatedMessages,
      pagination: {
        page,
        limit,
        totalMessages,
        hasMore: start > 0,
      },
    });
    // res.status(200).json({chat,targetUser});
  } catch (err) {
    console.log(err);
  }
});


chatRouter.patch("/chat/:targetUserId/seen", userAuth, async (req, res) => {
  const userId = req.user._id;
  const { targetUserId } = req.params;

  const chat = await Chat.findOne({
    participants: { $all: [userId, targetUserId] },
  });

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  chat.messages.forEach((message) => {
    if (message.senderId.toString() === targetUserId && !message.seen) {
      message.seen = true;
    }
  });

  await chat.save();

  res.status(200).json({ success: true });
});

module.exports = chatRouter;

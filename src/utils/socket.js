const socket = require("socket.io");
const crypto = require("crypto");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("process.env.JWT_SECRET", process.env.JWT_SECRET);

  // io.use((socket, next) => {
  //   try {
  //     const cookies = cookie.parse(socket.handshake.headers.cookie || "");

  //     const token = cookies.token;

  //     console.log("socket-token",token);

  //     if (!token) {
  //       return next(new Error("Authentication failes"));
  //     }

  //     const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //     socket.user = decoded;

  //     next();
  //   } catch (err) {
  //     next(new Error("Authentication failed"));
  //   }
  // });

  io.on("connection", (socket) => {
    // handle events
    // console.log("Connected:", socket.user);
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " Joining Room:" + roomId);

      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        // save mesages to the database

        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + " " + text);

          // check if userid & targetUserId are friends

          const isUserIdTargetFriends = await ConnectionRequest.findOne({
            $or: [
              {
                fromUserId: userId,
                toUserId: targetUserId,
                status: "accepted",
              },
              {
                fromUserId: targetUserId,
                toUserId: userId,
                status: "accepted",
              },
            ],
          });

          if (!isUserIdTargetFriends) {
            throw new Error("Users are not connected");
          }

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();

          io.to(roomId).emit("messageReceived", {
            firstName,
            lastName,
            text,
            timestamp: new Date(),
          });
        } catch (err) {
          console.error(err.message);
        }
      },
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;

const socket = require("socket.io");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const Chat = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

// userId -> Set(socketIds)
const onlineUsers = new Map();

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Convert Express middleware to Socket.IO middleware
  const wrapMiddleware = (middleware) => (socket, next) =>
    middleware(socket.request, {}, next);

  io.use(wrapMiddleware(cookieParser()));

  // Authenticate socket
  io.use((socket, next) => {
    try {
      const token = socket.request.cookies?.token;

      if (!token) {
        return next(new Error("Authentication failed"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = decoded;

      next();
    } catch (err) {
      console.log("Socket Authentication Error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.user);

    const userId = socket.user._id.toString();

    socket.userId = userId;

    // ----------------------------
    // Add user to online users
    // ----------------------------
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    console.log("Online Users:", [...onlineUsers.keys()]);

    // Send all online users to this client
    socket.emit("onlineUsers", [...onlineUsers.keys()]);

    // Notify everyone this user came online
    io.emit("userStatusChanged", {
      userId,
      isOnline: true,
    });

    // ----------------------------
    // Join Chat Room
    // ----------------------------
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);

      console.log(`${firstName} joined room ${roomId}`);

      socket.join(roomId);

      // Tell this user whether the other person is online
      socket.emit("userStatusChanged", {
        userId: targetUserId,
        isOnline: onlineUsers.has(targetUserId),
      });
    });

    // ----------------------------
    // Send Message
    // ----------------------------
    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);

          const isConnected = await ConnectionRequest.findOne({
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

          if (!isConnected) {
            throw new Error("Users are not connected");
          }

          let chat = await Chat.findOne({
            participants: {
              $all: [userId, targetUserId],
            },
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
            seen: false,
          });

          await chat.save();

          io.to(roomId).emit("messageReceived", {
            firstName,
            lastName,
            text,
            timestamp: new Date(),
          });
        } catch (err) {
          console.log(err.message);

          socket.emit("messageError", {
            message: err.message,
          });
        }
      },
    );

    // seen messages

    socket.on("messagesSeen", async ({ userId, targetUserId }) => {
      try {
        const roomId = getSecretRoomId(userId, targetUserId);

        const chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) return;

        let updated = false;

        chat.messages.forEach((message) => {
          // Only messages sent by the other person
          if (message.senderId.toString() === targetUserId && !message.seen) {
            message.seen = true;
            updated = true;
          }
        });

        if (updated) {
          await chat.save();

          io.to(roomId).emit("messagesSeen");
        }
      } catch (err) {
        console.log(err);
      }
    });

    // ----------------------------
    // Disconnect
    // ----------------------------
    socket.on("disconnect", () => {
      const userId = socket.userId;

      if (!userId || !onlineUsers.has(userId)) return;

      const sockets = onlineUsers.get(userId);

      sockets.delete(socket.id);

      // User is offline only if ALL tabs are closed
      if (sockets.size === 0) {
        onlineUsers.delete(userId);

        io.emit("userStatusChanged", {
          userId,
          isOnline: false,
        });
      }

      console.log("Online Users:", [...onlineUsers.keys()]);
    });
  });
};

module.exports = initializeSocket;

// old code

// const socket = require("socket.io");
// const crypto = require("crypto");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// const Chat = require("../models/chat");
// const ConnectionRequest = require("../models/connectionRequest");

// const getSecretRoomId = (userId, targetUserId) => {
//   return crypto
//     .createHash("sha256")
//     .update([userId, targetUserId].sort().join("_"))
//     .digest("hex");
// };

// const onlineUsers = new Map();

// const initializeSocket = (server) => {
//   const io = socket(server, {
//     cors: {
//       origin: "http://localhost:5173",
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);

//   // Socket authentication middleware

//   // Adapter so Express-style middleware (req, res, next) works with Socket.IO's (socket, next)
//   const wrapMiddleware = (middleware) => (socket, next) =>
//     middleware(socket.request, {}, next);

//   io.use(wrapMiddleware(cookieParser()));

//   io.use((socket, next) => {
//     try {
//       const token = socket.request.cookies?.token;

//       if (!token) {
//         return next(new Error("Authentication failed"));
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       socket.user = decoded;

//       next();
//     } catch (err) {
//       console.log("mid", err.message);

//       next(new Error("Authentication failed"));
//     }
//   });

//   io.on("connection", (socket) => {
//     // handle events
//     console.log("Connected:", socket.user);
//     socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
//       const roomId = getSecretRoomId(userId, targetUserId);
//       console.log(firstName + " Joining Room:" + roomId);

//       socket.join(roomId);

//       // track this user id as online, and also need to cleanup on disconnect

//       if (!onlineUsers.has(userId)) {
//         onlineUsers.set(userId, new Set());
//       }
//       onlineUsers.get(userId).add(socket.id);
//       socket.userId = userId; //  stash for disconnect handler

//       // Tell everyone in this room the current online status of both participants
//       io.to(roomId).emit("userStatusChanged", {
//         userId,
//         isOnline: true,
//       });

//       // Also tell the newly-joined user whether the target is currently online
//       socket.emit("userStatusChanged", {
//         userId: targetUserId,
//         isOnline: onlineUsers.has(targetUserId),
//       });
//     });

//     socket.on(
//       "sendMessage",
//       async ({ firstName, lastName, userId, targetUserId, text }) => {
//         // save mesages to the database

//         try {
//           const roomId = getSecretRoomId(userId, targetUserId);
//           console.log(firstName + " " + text);

//           // check if userid & targetUserId are friends

//           const isUserIdTargetFriends = await ConnectionRequest.findOne({
//             $or: [
//               {
//                 fromUserId: userId,
//                 toUserId: targetUserId,
//                 status: "accepted",
//               },
//               {
//                 fromUserId: targetUserId,
//                 toUserId: userId,
//                 status: "accepted",
//               },
//             ],
//           });

//           if (!isUserIdTargetFriends) {
//             throw new Error("Users are not connected");
//           }

//           let chat = await Chat.findOne({
//             participants: { $all: [userId, targetUserId] },
//           });

//           if (!chat) {
//             chat = new Chat({
//               participants: [userId, targetUserId],
//               messages: [],
//             });
//           }

//           chat.messages.push({
//             senderId: userId,
//             text,
//           });

//           await chat.save();

//           io.to(roomId).emit("messageReceived", {
//             firstName,
//             lastName,
//             text,
//             timestamp: new Date(),
//           });
//         } catch (err) {
//           console.error(err.message);
//           socket.emit("messageError", {
//             message: err.message,
//           });
//         }
//       },
//     );

//     socket.on("disconnect", () => {
//       const userId = socket.userId;
//       if (!userId || !onlineUsers.has(userId)) return;

//       const userSockets = onlineUsers.get(userId);
//       userSockets.delete(socket.id);

//       // Only mark fully offline once ALL of that user's sockets/tabs are gone

//         if (userSockets.size === 0) {
//         onlineUsers.delete(userId);
//         io.emit("userStatusChanged", { userId, isOnline: false });
//       }
//     });
//   });
// };

// module.exports = initializeSocket;

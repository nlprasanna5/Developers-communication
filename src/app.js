const express = require("express");
const { connectDb } = require("./config/database");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();

const { userAuth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());


const authRouter = require("./routes/auth");
const profileRouter= require("./routes/profile");
const requestRouter = require("./routes/request");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter)

connectDb()
  .then(() => {
    console.log("Db connected successfully");
    app.listen(4000, (req, res) => {
      console.log("Server created successfully");
    });
  })
  .catch((err) => {
    console.error("Db connection failed");
  });



// ******** previous version apis ********

// app.post("/signup", async (req, res) => {
//   try {
//     // validate the data
//     validateSignUpData(req);

//     const { firstName, lastName, password, emailId } = req.body;

//     // encrypt password
//     const passwordHash = await bcrypt.hash(password, 10);

//     const userDetails = {
//       firstName,
//       lastName,
//       emailId,
//       password: passwordHash,
//     };

//     const user = new User(userDetails);
//     await user.save();
//     res.send("saved successfully");
//   } catch (err) {
//     console.log("error", err);

//     res.status(400).send("Error: " + err);
//   }
// });

// app.post("/login", async (req, res) => {
//   try {
//     const { emailId, password } = req.body;

//     const user = await User.findOne({ emailId: emailId });

//     if (!user) {
//       throw new Error("Invalid credentails");
//     }

//     const isPasswordValid = await user.validatePassword(password);

//     if (!isPasswordValid) {
//       throw new Error("Invalid credentails");
//     } else {
//       // create jwt token

//       const token = await user.getJWT();

//       console.log("token", token);

//       res.cookie("token", token, {
//         expires: new Date(Date.now() + 8 * 3600000),
//       });
//       res.send("Login Successful!");
//     }
//   } catch (err) {
//     console.log("error", err);
//     res.status(400).send("Error: " + err);
//   }
// });

// app.get("/profile", userAuth, async (req, res) => {
//   try {
//     const user = req.user;

//     res.send(user);
//   } catch (err) {
//     console.log("error", err);
//     res.status(400).send("Error: " + err);
//   }
// });

// app.post("/sendConnectionRequest", userAuth, (req, res) => {
//   try {
//     const user = req.user;
//     res.send(user.firstName + " send the Request ");
//   } catch (err) {
//     res.status(400).send("Error" + err.message);
//   }
// });

// project apis end
// *********************
// own apis

// app.get("/user", async (req, res) => {
//   const singleUser = req.body;

//   try {
//     const users = await User.find({ emailId: singleUser.emailId });
//     if (users.length === 0) {
//       res.status(400).send("User not found");
//     } else {
//       res.send(users);
//     }
//   } catch (err) {
//     res.status(400).send("Something went wrong and " + err._message);
//   }
// });

// app.get("/singleUser", async (req, res) => {
//   try {
//     const user = await User.findOne({ emailId: "gangadhar@gmail.com" });
//     if (!user) {
//       res.status(400).send("User not found");
//     } else {
//       res.send(user);
//     }
//   } catch (err) {
//     res.status(400).send("Something went wrong");
//   }
// });

// // user by id

// app.get("/user/:userId", async (req, res) => {
//   try {
//     const id = req.params;
//     console.log("id", id);

//     const user = await User.findById(id.userId);
//     if (!user) {
//       res.status(400).send("User not found by id");
//     } else {
//       res.send(user);
//     }
//   } catch (err) {
//     res.status(400).send("Something went wrong");
//   }
// });

// app.get("/feed", async (req, res) => {
//   try {
//     const users = await User.find({});

//     res.send(users);
//   } catch (err) {
//     res.status(400).send("Something went wrong");
//   }
// });

// app.delete("/user", async (req, res) => {
//   try {
//     const id = req.body.userId;
//     const user = await User.findByIdAndDelete(id);

//     if (!user) {
//       res.status(400).send("User not found");
//     } else {
//       res.send("User deleted successfully");
//     }
//   } catch (err) {
//     res.status(400).send("Something went wrong");
//   }
// });

// app.patch("/user/:userId", async (req, res) => {
//   try {
//     const userId = req.params?.userId;
//     const data = req.body;

//     console.log("data", data);

//     const ALLOWED_UPDATES = ["skills", "photoUrl", "about", "age", "gender"];

//     const isUpdateAllowed = Object.keys(data).every((key) =>
//       ALLOWED_UPDATES.includes(key),
//     );

//     console.log("update", isUpdateAllowed);

//     if (!isUpdateAllowed) {
//       throw new Error("Update not allowed");
//     }

//     // if(data.skills.length !== new Set(data.skills).size){
//     //   throw new Error("Duplicate skills are not allowed")
//     // }

//     if (data.skills.length > 10) {
//       throw new Error("No. of skills should be less than or equal to 10");
//     }

//     const user = await User.findByIdAndUpdate({ _id: userId }, data, {
//       returnDocument: "before",
//       runValidators: true,
//     });

//     console.log("user");

//     if (!user) {
//       res.status(400).send("User not found");
//     } else {
//       res.send("user updated successfully");
//     }
//   } catch (err) {
//     res.status(400).send("Something went wrong " + err.message);
//   }
// });

// app.patch("/user", async (req, res) => {
//   try {
//     const data = req.body;

//     const user =await User.findOneAndUpdate({ emailId: data.emailId }, data,{new:true});
//     if (!user) {
//       res.status(400).send("User not found");
//     } else {
//       res.send("User updated successfully");
//     }
//   } catch (err) {
//     res.status(400).send("Something went wrong");
//   }
// });

const express = require("express");


const app = express();
const {adminAuth, userAuth}= require("./middlewares/auth")

// handle auth middleware for all request GET, POST

app.use("/admin",adminAuth);

app.post("/user/login",(req,res) => {
    res.send("User logged in successfully!")
})

app.get("/user",userAuth,(req,res) => {
    res.send("User Data Sent")
})

// app.use("/admin",(req,res,next) => {
//     console.log("Admin aut is getting checked!!");
    
//     const token ="xyz";
//     const isAdminAuthorized = token === "xyz";
//     if(!isAdminAuthorized){
//         res.status(401).send("unthorized request")
//     }else{
//         next();
//     }

// });

app.get("/admin/getAllData", (req, res) => {
 
    res.send("All Data Sent");
 
});

app.get("/admin/deleteUser", (req, res) => {
  res.send("Deleted a user");
});

// app.get("/user",(req,res,next) => {
//     console.log("Handling the route user 2!!");
//     res.send("2nd oute Handler");

// });

// app.get("/user",(req,res,next) => {
//     console.log("Handling the route user!!");
//     next();

// });

// app.use(
//   "/user",
//   [
//     (req, res, next) => {
//       console.log("handling te route user!!");

//       next();
//       res.send("Response");
//     },
//     (req, res, next) => {
//       console.log("Handling the route user 2!!");
//       res.send("2nd respnse");
//       next();
//     },
//   ],
//   (req, res) => {
//     console.log("Handling the route user 3!!");
//     res.send("3rd respnse");
//   },
// );

app.listen(3000, () => {
  console.log("Serving is running on port 3000");
});

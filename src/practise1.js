
const express = require("express");

const app = express();





app.get("/users",(req,res,next) => {
    const err = new Error("Database connection failed");
     next(err);
    res.send("users")
   
})


app.use((err,req,res,next) => {
       const error = new Error("Database connection failed");
    if(error){
        res.status(500).send("Something went wrong");
         next(error)
    }

   

})
 
// app.get("/",(req,res) => {
//     res.send("dashboard")
// })

// app.use((err, req,res,next) => {
//       res.status(500).send(err.message);
// })

// app.all("/user",(req,res) => {
//     res.send("new dashboard")
// });

// app.get("/user",(req,res) => {
//     res.send("first user")
// });

// app.put("/user",(req,res) => {
//     res.send("update furst")
// })


// app.use("/hello",(req,res,next) => {
//     res.send("hello")
// })

// app.use("/",(req,res,next) => {
//     res.send("dashboard");
//     next()
// });






app.listen(4000,(req,res) => {
    console.log("Server created successfully");
    
})
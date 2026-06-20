
const express = require("express");

const app = express()




// app.get("/user/:userId/:name",(req,res) => {
//     console.log("params",req.params);
    
//     res.send({firstName:"Lakshmi",lastName:"Prasanna"})
// })


// app.get("/user",(req,res) => {
//     console.log(req.query);
    
//     res.send({firstName:"Lakshmi",lastName:"Prasanna"})
// })


// app.post("/user",(req,res) => {
//     console.log("data send to databafe");

//     res.send("Data successfully saved")
    
// });

// app.delete("/user",(req,res) => {
//     res.send("Deleted successfully!")
// })









// app.use("/test",(req,res) => {
//     res.send("Hello from express")
// })


// app.use("/",(req,res) => {
//     res.send("Message from root page")
// })


// these route string patterns only supprts in express 4, it does not support in express 5

// app.get("/ab+c",(req,res) => {
//     res.send({firstName:"Ram",lastName:"Krishna"});
// });

// app.get("/use?r",(req,res) => {
//     res.send({firstName:"Ram",lastName:"Krishna"});
// });

app.listen(3000,() => {
    console.log("Serving is running on port 3000");
    
})
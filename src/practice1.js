const express = require("express");

const app = express();

app.use("/",(req,res,next) => {
    const error =  new Error("hkjfrgkj")
    if(error){
          next(error)
        res.status(500).send("Something went wrong");
      
    }

})

app.get("/getUserData",(req,res) => {
    // throw new Error("frvgx");
    try{
        throw new Error("dewgrvgretv");
        res.send("User data")
    } catch(err){
        res.status(500).send("Some error contact suppor team")
    }
});

app.use((err,req,res,next) => {
    res.status(501).send("Something is fishy")
})




app.listen(3000, () => {
  console.log("Serving is running on port 3000");
});


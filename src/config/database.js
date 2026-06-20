
const mongoose = require("mongoose");

const connectDb= async() => {
    await mongoose.connect("mongodb+srv://nlprasanna52_db_user:zojVUA2fLRX5NGzO@node-season1.r3hkwum.mongodb.net/devTinder")
}


module.exports ={connectDb}



const mongoose = require("mongoose");

const connectRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required:true
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required:true
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "rejected", "accepted"],
        message: `{VALUE} is incorrect status type`,
      },
      required:true
    },
  },
  {
    timestamps: true,
  },
);


const ConnetionRequestModel = new mongoose.model("ConnetionRequest",connectRequestSchema);

module.exports = ConnetionRequestModel
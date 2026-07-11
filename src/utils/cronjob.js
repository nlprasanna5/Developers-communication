const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnetionRequest  = require("../models/connectionRequest");

cron.schedule("29 15 * * *", async() => {
  console.log("Hello World", +new Date());
  try {
    const yesterday = subDays(new Date(), 0);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnetionRequest.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    const listOfEmails = [new Set(pendingRequests.map((req) => req.toUserId.emailId))]

    console.log("listOfEmails",listOfEmails);
    

    for(const email of listOfEmails){
        // code to send email using aws 
    }
  } catch (err) {
    console.log(err);
  }
});

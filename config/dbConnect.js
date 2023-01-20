const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connected");
  } catch (error) {
    console.log("DB Connection failed", error.message);
  }
};

//

dbConnect();
module.exports = dbConnect;

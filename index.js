const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const dotenv = require("dotenv");
const userRoutes = require("./app/user/userRoutes.js");
const websiteRoutes = require("./app/websites/websiteRoutes.js");
const mongoose=require('mongoose')
const mongoConnect = require("./db.js");
const cronJob = require("./cronJob.js");
const axios=require("axios");
const encrypter = require("./app/utilities/encryption.js");
const decrypter = require("./app/utilities/decryption.js");
const websiteSchema = require("./app/websites/websiteSchema.js");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.listen(process.env.PORT, async () => {
  console.log("BACKEND RUNNING ON :", process.env.PORT);
  mongoConnect();
});

app.get("/", (req, res) => {
  res.send("Working");
});

cron.schedule(process.env.TIME, cronJob);
cron.schedule("*/10 * * * *", async ()=>{
  const response=await axios.get(process.env.BURL)
  console.log(response.data);
});

app.use(userRoutes);
app.use(websiteRoutes);



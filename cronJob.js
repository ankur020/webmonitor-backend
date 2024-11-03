const websiteSchema = require("./app/websites/websiteSchema");
const axios = require("axios");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const decrypter = require("./app/utilities/decryption");
dotenv.config();

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const isWebsiteActive = async (url) => {
  if (!url) return false;
  const response = await axios.get(url).catch((e) => {
    void e;
  });

  if (!response || response.status !== 200) return false;

  return true;
};

const cronJob = async () => {
  console.log("inside node cron");
  const websites = await websiteSchema
    .find({})
    .populate({ path: "userId", select: ["name", "email"] });

  if (!websites.length) return;
  const allWebsites = websites.map((website) => {
    return {
      ...website.toObject(),
      url: decrypter(website.url),
    };
  });


  for (i = 0; i < allWebsites.length; i++) {
    let weburl = allWebsites[i].url;
    if (allWebsites[i].isMonitoring) {
      const isActive = await isWebsiteActive(weburl);
      console.log(
        weburl,
        " currentStatus:",
        allWebsites[i].isActive,
        " NewStatus: ",
        isActive
      );

      await websiteSchema.updateOne(
        { _id: allWebsites[i]._id },
        { isActive: isActive }
      );
      if (!isActive && allWebsites[i].isActive) {
        console.log("sending mail");
        transport.sendMail({
          from: process.env.EMAIL,
          to: allWebsites[i].userId.email,
          subject: "website down " + allWebsites[i].url,
          html: `Your Website <b> ${
            allWebsites[i].url
          } </b> is down . As we checked on ${new Date().toLocaleDateString(
            "en-in"
          )}`,
        });
      }
    } else {
      console.log(weburl, " Not being Monitored");
    }
  }
};

module.exports = cronJob;

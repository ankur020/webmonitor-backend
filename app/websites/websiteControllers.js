const mongoose = require("mongoose");
const websiteSchema = require("./websiteSchema");
const axios = require("axios");
const decrypter = require("../utilities/decryption.js");
const encrypter = require("../utilities/encryption.js");
const {validateUrl} = require("../utilities/Validations.js");

const createWebsite = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({
      status: false,
      message: "URL required",
    });

    return;
  }

  if (!validateUrl(url)) {
    res.status(422).json({
      status: false,
      message: "Invalid URL",
    });

    return;
  }

  const websites = await websiteSchema.find({
    userId: req.user._id,
  });

  const decryptedwebsites= websites.map((website)=>{
    return({
      ...website.toObject(),
      url: decrypter(website.url)
    })
  })

  for(let web in decryptedwebsites){
    
    if(decryptedwebsites[web].url==url){
      res.status(422).json({
        status: false,
        message: "website already added",
      });
      return;
    }
  }

  const response = await axios.get(url).catch((e) => {
    void e;
  });


  if (!response || response.status !== 200) {
    res.status(422).json({
      status: false,
      message: "Website with " + url + " is not active",
    });

    return;
  }

  const newWebsite = new websiteSchema({
    url:encrypter(url) ,
    userId: req.user._id,
    isActive: true,
  });

  newWebsite
    .save()
    .then((website) => {
      res.status(201).json({
        status: true,
        message: "Website Added for user: " + req.user.name,
        data: website,
      });
    })
    .catch((e) => {
      res.status(422).json({
        status: false,
        message: "error creating website",
      });
    });
};

const deleteWebsite = async (req, res) => {
  const id = req.query.webId;

  await websiteSchema
    .deleteOne({ _id: id })
    .then((website) => {
      res.status(201).json({
        status: true,
        message: "Websitedeleted",
        data: website,
      });
    })
    .catch((e) => {
      res.status(422).json({
        status: false,
        message: "error creating website",
      });
    });
};

const toggleMonitor = async (req, res) => {
  const id  = req.query.webId;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(422).json({
      status: false,
      message: 'Invalid webId',
    });
  }


  await websiteSchema.findOneAndUpdate(
    { _id: id },
    { $set: {isMonitoring: req.query.isMonitoring=="false"?false:true} },
    { new: true }
   ).then((website) => {
      res.status(200).json({
        status: true,
        message: "Updated Monitoring status",
        data: website,
      });
    })
    .catch((e) => {
      res.status(422).json({
        status: false,
        message: "error toggling monitoring status",
      });
    });
};

const getAllWebsites = async (req, res) => {
  const response = await websiteSchema
    .find({ userId: req.user._id }).populate(
       { path:"userId",
        select:["name","email"]
        }
    )
    .then((websites) => {

      const websiteResponse= websites.map((website)=>{

        return {
          ...website.toObject(),
          url: decrypter(website.url),
        };

      })

      res.status(201).json({
        status: true,
        message: "success",
        data: websiteResponse,
      });
    })
    .catch((e) => {
      res.status(422).json({
        status: false,
        message: "error getting websites",
      });
    });
};

module.exports = {
  createWebsite,
  deleteWebsite,
  getAllWebsites,
  toggleMonitor
};

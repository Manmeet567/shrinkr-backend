const mongoose = require("mongoose");

// Define the Link schema
const LinkSchema = new mongoose.Schema(
  {
    destination_url: {
      type: String,
      required: true, 
    },
    remarks: {
      type: String,
      required: true, 
    },
    expiration: {
      type: Date,
      default: null, 
    },
    short_url_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Create the Link model
const LinkModel = mongoose.model("Link", LinkSchema);

module.exports = LinkModel;

const mongoose = require("mongoose");

const ClickSchema = new mongoose.Schema(
  {
    short_url_id: {
      type: String,  
      required: true,
    },
    device: {
      type: String,
      enum: ["mobile", "tablet", "desktop"], 
      required: true,
    },
    IP: {
      type: String,
      required: true, 
    },
  },
  { timestamps: true }
);

const ClickModel = mongoose.model("Click", ClickSchema);

module.exports = ClickModel;

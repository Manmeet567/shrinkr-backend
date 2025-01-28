const mongoose = require("mongoose");

const ClickSchema = new mongoose.Schema(
  {
    original_url:{
      type:String,
      required:true
    },
    short_url_id: {
      type: String,  
      required: true,
    },
    device: {
      type: String,
      enum: ["mobile", "tablet", "desktop"], 
      required: true,
    },
    user_os:{
      type:String,
      required: true
    },
    IP: {
      type: String,
      required: true, 
    },
    belongs_to:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true
    }
  },
  { timestamps: true }
);

const ClickModel = mongoose.model("Click", ClickSchema);

module.exports = ClickModel;

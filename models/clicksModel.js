const mongoose = require("mongoose");

const ClickSchema = new mongoose.Schema(
  {
    short_url_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Link model
      ref: "Link", // Reference to the Link schema
      required: true,
    },
    device: {
      type: String,
      enum: ["mobile", "tablet", "desktop"], // Limit device values to these options
      required: true,
    },
    IP: {
      type: String,
      required: true, // Store the user's IP address
    },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

// Create the Click model
const ClickModel = mongoose.model("Click", ClickSchema);

module.exports = ClickModel;

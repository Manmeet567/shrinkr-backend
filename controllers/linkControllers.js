const LinkModel = require("../models/linkModel");
let nanoid;
(async () => {
  nanoid = (await import("nanoid")).nanoid; // Dynamically import nanoid
})();

// Controller to create a new link
const createLink = async (req, res) => {
  try {
    const { destination_url, remarks, expiration } = req.body;

    if (!destination_url || !remarks) {
      return res.status(400).json({ message: "Destination URL and remarks are required." });
    }

    const short_url_id = nanoid(8); // Generate an 8-character ID (you can adjust the length)

    const newLink = new LinkModel({
      destination_url,
      remarks,
      expiration: expiration || null, // Optional expiration
      short_url_id,
    });

    // Save the link to the database
    await newLink.save();

    // Respond with the created link
    res.status(201).json({
      message: "Link created successfully.",
      link: newLink,
    });
  } catch (error) {
    console.error("Error creating link:", error);
    res.status(500).json({
      message: "An error occurred while creating the link.",
      error: error.message,
    });
  }
};

module.exports = { createLink };

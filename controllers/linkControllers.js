const Link = require("../models/linkModel");
let nanoid;
(async () => {
  nanoid = (await import("nanoid")).nanoid; // Dynamically import nanoid
})();

// Controller to create a new link
const createLink = async (req, res) => {
  try {
    const { destination_url, remarks, expiration } = req.body;

    if (!destination_url || !remarks) {
      return res
        .status(400)
        .json({ message: "Destination URL and remarks are required." });
    }

    const short_url_id = nanoid(8); // Generate an 8-character ID (you can adjust the length)

    const newLink = new Link({
      destination_url,
      remarks,
      expiration: expiration || null, // Optional expiration
      short_url_id,
      createdBy: req.user._id,
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

const getLinks = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    const totalLinks = await Link.countDocuments({ createdBy: userId });

    const links = await Link.find({ createdBy: userId })
      .skip(skip)
      .limit(limitNumber);

    if (!links || links.length === 0) {
      return res.status(200).json({
        links: [],
        totalLinks,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalLinks / limitNumber),
      });
    }

    return res.status(200).json({
      links,
      totalLinks,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalLinks / limitNumber),
    });
  } catch (error) {
    console.error("Error fetching user links:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { createLink, getLinks };

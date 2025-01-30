const Link = require("../models/linkModel");
const Click = require("../models/clicksModel");
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

const updateLink = async (req, res) => {
  try {
    const { _id } = req.params;
    const { destination_url, remarks, expiration } = req.body;
    console.log(req.body);

    if (!destination_url || !remarks) {
      return res
        .status(400)
        .json({ error: "Destination URL and Remarks are required." });
    }

    const link = await Link.findById(_id);
    if (!link) {
      return res.status(404).json({ error: "Link not found." });
    }

    link.destination_url = destination_url
      ? destination_url
      : link.destination_url;
    link.remarks = remarks ? remarks : link.remarks;
    link.expiration = expiration ? expiration : link.expiration;

    await link.save();

    return res
      .status(200)
      .json({ message: "Link updated successfully.", link });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Something went wrong.", details: error.message });
  }
};

const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLink = await Link.findByIdAndDelete(id);

    if (!deletedLink) {
      return res.status(404).json({ message: "Link not found" });
    }
    
    await Click.deleteMany({ short_url_id: deletedLink.short_url_id });

    res.status(200).json({
      message: "Link successfully deleted",
      deletedLink,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting link", error: error.message });
  }
};

module.exports = { createLink, getLinks, updateLink, deleteLink };

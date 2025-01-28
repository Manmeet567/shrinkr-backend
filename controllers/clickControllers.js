const Click = require("../models/clicksModel");
const Link = require("../models/linkModel");
const User = require("../models/userModel");
const requestIp = require("request-ip");
const UAParser = require("ua-parser-js");

const submitClick = async (req, res) => {
  try {
    const { url_id } = req.params;

    // Find the URL document
    const urlDocument = await Link.findOne({ short_url_id: url_id });
    if (!urlDocument) {
      return res.status(404).send({ message: "Short URL not found" });
    }

    const destination_url = urlDocument.destination_url;

    // Parse user-agent
    const userAgent = req.headers["user-agent"];
    const parser = new UAParser(userAgent);
    const deviceType = parser.getDevice().type || "desktop";
    const userOS = parser.getOS().name || "Unknown OS";

    // Increment the count and save the link document
    urlDocument.count = (urlDocument.count || 0) + 1; // Increment safely
    await urlDocument.save(); // Save the updated document

    const device =
      deviceType === "mobile" || deviceType === "tablet"
        ? deviceType
        : "desktop";

    const ipAddress = requestIp.getClientIp(req);

    // Save the click data
    const clickData = new Click({
      original_url: destination_url,
      short_url_id: url_id,
      device,
      user_os: userOS,
      IP: ipAddress,
      belongs_to: urlDocument.createdBy,
    });
    await clickData.save();

    // Redirect the user to the destination URL
    return res.redirect(destination_url);
  } catch (error) {
    console.error("Error in submitClick:", error);
    res
      .status(500)
      .send({ message: "An error occurred. Please try again later." });
  }
};

const getClicks = async (req, res) => {
  try {
    const userId = req.user._id; // Authenticated user ID
    const { shortUrlIds = [], page = 1, limit = 10 } = req.body;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Validate shortUrlIds array
    if (!Array.isArray(shortUrlIds) || shortUrlIds.length === 0) {
      return res
        .status(400)
        .json({ error: "shortUrlIds array is required and cannot be empty." });
    }

    // Count total clicks for the provided shortUrlIds
    const totalClicks = await Click.countDocuments({
      belongs_to: userId,
      short_url_id: { $in: shortUrlIds },
    });

    // Fetch clicks with pagination
    const clicks = await Click.find({
      belongs_to: userId,
      short_url_id: { $in: shortUrlIds },
    })
      .skip(skip)
      .limit(limitNumber);

    return res.status(200).json({
      clicks,
      totalClicks,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalClicks / limitNumber),
    });
  } catch (error) {
    console.error("Error fetching user clicks:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { submitClick, getClicks };

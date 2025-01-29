const Click = require("../models/clicksModel");
const Link = require("../models/linkModel");
const requestIp = require("request-ip");
const UAParser = require("ua-parser-js");
const mongoose = require('mongoose');

const getClickAnalytics = async (req, res) => {
  const userId = req.user._id;
  try {
    const links = await Link.find({
      createdBy: new mongoose.Types.ObjectId(userId), 
    }).select("short_url_id");

    if (!links.length) {
      return res.status(404).json({ message: "No links found for the user" });
    }

    const shortUrlIds = links.map((link) => link.short_url_id);

    const clickAnalytics = await Click.aggregate([
      {
        $match: { short_url_id: { $in: shortUrlIds } }, 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } }, 
          totalClicks: { $sum: 1 }, 
        },
      },
      {
        $sort: { _id: -1 }, // Sort by date in descending order
      },
    ]);

    const deviceCount = await Click.aggregate([
      {
        $match: { short_url_id: { $in: shortUrlIds } }, 
      },
      {
        $group: {
          _id: "$device", 
          count: { $sum: 1 }, 
        },
      },
    ]);

    const result = {
      totalClicks: clickAnalytics.reduce(
        (acc, day) => acc + day.totalClicks,
        0
      ),
      dailyClicks: clickAnalytics.map((day) => {
        const [dayPart, monthPart, yearPart] = day._id.split("-"); // Split the date string
        const shortYear = yearPart.slice(-2); // Extract the last two digits of the year
        const formattedDate = `${dayPart}-${monthPart}-${shortYear}`; // Format as DD-MM-YY

        return {
          date: formattedDate,
          totalClicks: day.totalClicks,
        };
      }),
      deviceCount: deviceCount.reduce(
        (acc, device) => {
          acc[device._id] = device.count;
          return acc;
        },
        { mobile: 0, tablet: 0, desktop: 0 } 
      ),
    };

    res.status(200).json(result); 
  } catch (error) {
    console.error("Error fetching click analytics:", error); 
    res.status(500).json({ message: "Server error. Failed to fetch click analytics." });
  }
};




const submitClick = async (req, res) => {
  try {
    const { url_id } = req.params;

    // Find the URL document
    const urlDocument = await Link.findOne({ short_url_id: url_id });
    if (!urlDocument) {
      return res.send("<p>Invalid Link</p>");
      // return res.status(404).send({ message: "Short URL not found" });
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


module.exports = { submitClick, getClicks, getClickAnalytics };

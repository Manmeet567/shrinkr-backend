const Click = require("../models/clicksModel");
const Link = require("../models/linkModel");
const requestIp = require("request-ip");

const submitClick = async (req, res) => {
  try {
    const { url_id } = req.params;

    const urlDocument = await Link.findOne({ short_url_id: url_id });
    if (!urlDocument) {
      return res.status(404).send({ message: "Short URL not found" });
    }

    const destination_url = urlDocument.destination_url;

    const userAgent = req.headers["user-agent"];
    let device = "desktop";
    if (/mobile/i.test(userAgent)) {
      device = "mobile";
    } else if (/tablet/i.test(userAgent)) {
      device = "tablet";
    }

    const ipAddress = requestIp.getClientIp(req);

    const clickData = new Click({
      short_url_id: url_id,
      device,
      IP: ipAddress,
    });

    const savedClick = await clickData.save();

    res.redirect(destination_url);

    console.log("Click document saved");
  } catch (error) {
    console.error("Error in submitClick:", error);
    res
      .status(500)
      .send({ message: "An error occurred. Please try again later." });
  }
};

module.exports = { submitClick };

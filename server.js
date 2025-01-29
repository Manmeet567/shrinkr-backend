const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const linkRoutes = require("./routes/linkRoutes");
const { submitClick } = require("./controllers/clickControllers");
const clickRoutes = require("./routes/clickRoute");

const app = express();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use(express.json());

app.get("/test-server", (req, res) => {
  res.send("Server is working");
});

app.use("/api/user", userRoutes);
app.use("/api/link", linkRoutes);
app.use("/api/clicks", clickRoutes);

app.get("/:url_id", submitClick);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log("connected to DB and server listening on port", PORT);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
  });

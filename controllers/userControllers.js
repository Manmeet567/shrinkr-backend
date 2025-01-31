const User = require("../models/userModel");
const Link = require("../models/linkModel");
const Click = require("../models/clicksModel");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    const token = createToken(user._id);

    res.status(200).json({ token: token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const signupUser = async (req, res) => {
  const { name, email, mobileno, password } = req.body;

  try {
    const user = await User.signup(name, email, mobileno, password);

    const token = createToken(user._id);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error during user signup:", error);
    res.status(400).json({ error: error.message });
  }
};

const getUserData = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedFields = req.body;

    if (!Object.keys(updatedFields).length) {
      return res.status(400).json({ error: "No fields provided for update." });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
      runValidators: true, // Ensure any field constraints are respected (e.g. email format)
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({
      message: "User updated successfully.",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Server error while updating user." });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.params.id;

    // Step 1: Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    await Link.deleteMany({ createdBy: userId });

    await Click.deleteMany({ belongs_to: userId });

    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Error deleting account: ", error);
    res
      .status(500)
      .json({ message: "Failed to delete account and associated data." });
  }
};

module.exports = {
  loginUser,
  signupUser,
  getUserData,
  updateUserInfo,
  deleteAccount,
};

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ClothingItem = require("../models/clothingItemModel"); // Wardrobe items
const Outfit = require("../models/outfitModel"); // Saved outfits

const router = express.Router();

// Middleware to verify user token
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access Denied, Invalid Token Format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Ensure JWT contains `userId`
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// Update User Profile
router.put("/update", verifyToken, async (req, res) => {
  const { nickname, age, country, state, favoriteColor, gender } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.nickname = nickname || user.nickname;
    user.age = age || user.age;
    user.country = country || user.country;
    user.state = state || user.state;
    user.favoriteColor = favoriteColor || user.favoriteColor;
    user.gender = gender || user.gender;

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Delete User Profile
router.delete("/delete", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await ClothingItem.deleteMany({ userId });
    await Outfit.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;

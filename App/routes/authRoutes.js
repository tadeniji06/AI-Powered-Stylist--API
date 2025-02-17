const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const { getOutfitSuggestions } = require('../utils/openai');
const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ email, password });
    await newUser.save();
    console.log("User registered successfully");
    console.log("User ID:", newUser._id);
    const token = jwt.sign({ userId: newUser._id }, "your-secret-key", {
      expiresIn: "30d",
    });

    res.status(201).json({ token, userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "30d",
    });

    res.json({
      token,
      userId: user._id,
      onboardingComplete: user.onboardingComplete,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// onBoard stats
router.post("/updateOnboarding", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    user.onboardingComplete = true;
    await user.save();

    res.status(200).json({ message: "Onboarding complete" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// suggestions routes
router.post("/getOutfitSuggestions", async (req, res) => {
  const { userPreferences } = req.body;
  try {
    const outfit = await getOutfitSuggestions(userPreferences);
    res.json({ outfit });
  } catch (error) {
    res.status(500).json({ message: "Error fetching suggestions" });
    console.error("Error fetching suggestions:", error);  
  }
});

module.exports = router;

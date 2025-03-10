const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const axios = require("axios");

const { getOutfitSuggestions } = require("../utils/openai");
const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  const { nickname, email, password, age, country, state, favoriteColor, gender } = req.body;
  if (!nickname || !email || !password || !age || !country || !state || !favoriteColor || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    if (await User.findOne({ email })) return res.status(400).json({ message: "User already exists" });
    const newUser = new User({ nickname, email, password, age, country, state, favoriteColor, gender });
    console.log('New User Alert!', newUser)
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.status(201).json({ token, userId: newUser._id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({
      token, userId: user._id, onboardingComplete: user.onboardingComplete,
      age: user.age, country: user.country, state: user.state,
      favoriteColor: user.favoriteColor, gender: user.gender,
    });
    // console.log(res.status);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Onboarding update
router.post("/updateOnboarding", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    user.onboardingComplete = true;
    await user.save();

    res.status(200).json({ message: "Onboarding complete" });
    console.log("Onboarding complete for user", user.email);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Outfit suggestions route
router.get("/getOutfitSuggestions", async (req, res) => {
  const { userPreferences } = req.body;
  try {
    const outfit = await getOutfitSuggestions(userPreferences);
    res.json({ outfit });
  } catch (error) {
    res.status(500).json({ message: "Error fetching suggestions" });
    console.error("Error fetching suggestions:", error);
  }
});
// Request password reset
router.post("/requestReset", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    user.resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetTokenExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    const templateParams = { to_email: email, otp_code: user.resetToken };
    await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: process.env.service_id, 
      template_id: process.env.template_id, 
      user_id: process.env.user_id,
      template_params: templateParams,
    });
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Reset password
router.post("/resetPassword", async (req, res) => {
  const { email, otpCode, newPassword } = req.body;
  if (!email || !otpCode || !newPassword) return res.status(400).json({ message: "All fields are required" });
  try {
    const user = await User.findOne({ email });
    if (!user || user.resetToken !== otpCode || user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

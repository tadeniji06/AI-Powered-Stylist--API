const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const axios = require("axios");

const { getOutfitSuggestions } = require("../utils/openai");
const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  const {
    nickname, email, password, age, country, state, favoriteColor, gender,
  } = req.body;

  if (!nickname || !email || !password || !age || !country || !state || !favoriteColor || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const newUser = new User({ nickname, email, password, age, country, state, favoriteColor, gender });
    await newUser.save();
    console.log("User registered successfully", newUser);

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
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    console.log("Generated Token:", token); // Debugging

    res.json({
      token, userId: user._id, onboardingComplete: user.onboardingComplete,
      age: user.age, country: user.country, state: user.state,
      favoriteColor: user.favoriteColor, gender: user.gender,
    });

    console.log("User logged in successfully", user.email);
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

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = Date.now() + 10 * 60 * 1000;

    user.resetToken = otpCode;
    user.resetTokenExpires = expiryTime;
    await user.save();

    // Prepare EmailJS request with templateParams
    const templateParams = {
      to_email: email,
      otp_code: otpCode,
    };

    const response = await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        service_id: "service_fjsfni9",
        template_id: "template_2q6p5xg",
        user_id: "BcJuJqp5RGk6SA9pe",
        template_params: templateParams,
      }
    );

    console.log("EmailJS response:", response.data);
    console.log(`OTP sent to ${email}: ${otpCode}`);
    console.log("Stored Expiry Time:", user.resetTokenExpires);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Reset password
router.post("/resetPassword", async (req, res) => {
  const { email, otpCode, newPassword } = req.body;

  if (!email || !otpCode || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    console.log("Current Time:", Date.now());
    console.log("Stored Expiry Time:", user.resetTokenExpires);

    // Validate OTP and expiry time
    if (!user.resetToken || user.resetToken !== otpCode) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (!user.resetTokenExpires || user.resetTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });
    console.log(`Password updated for ${email}`);
  } catch (error) {
    console.log("Error resetting password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

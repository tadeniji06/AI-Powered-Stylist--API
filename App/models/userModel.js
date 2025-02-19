const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpires: { type: Number }, // Ensure this is stored as a Number
  onboardingComplete: { type: Boolean, default: false },
  age: { type: Number, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  favoriteColor: { type: String, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Auto-update `updatedAt` timestamp
UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Password comparison method
UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;

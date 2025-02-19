const mongoose = require("mongoose");

const OutfitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ type: String, required: true }], // List of clothing item names or image URLs
  occasion: { type: String }, // e.g., "Casual", "Business", "Party"
  weatherCondition: { type: String }, // e.g., "Sunny", "Rainy"
  mood: { type: String }, // e.g., "Casual Chill", "Business Formal"
  rating: { type: Number, min: 1, max: 5 }, // User feedback on AI suggestions
  createdAt: { type: Date, default: Date.now },
});

const Outfit = mongoose.model("Outfit", OutfitSchema);
module.exports = Outfit;

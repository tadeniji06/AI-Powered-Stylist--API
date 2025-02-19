const mongoose = require("mongoose");

const ClothingItemSchema = new mongoose.Schema({
 userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
 type: { type: String, required: true }, // e.g., "Shirt", "Pants", "Shoes"
 color: { type: String, required: true },
 imageUrl: { type: String, required: true },
 tags: [{ type: String }], // e.g., ["casual", "summer", "cotton"]
 createdAt: { type: Date, default: Date.now },
});

const ClothingItem = mongoose.model("ClothingItem", ClothingItemSchema);
module.exports = ClothingItem;

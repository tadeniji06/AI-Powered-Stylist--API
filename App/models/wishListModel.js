const WishlistSchema = new mongoose.Schema({
 userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
 itemName: { type: String, required: true },
 shopLink: { type: String, required: true },
 imageUrl: { type: String },
 price: { type: Number },
 createdAt: { type: Date, default: Date.now },
});

const Wishlist = mongoose.model("Wishlist", WishlistSchema);
module.exports = Wishlist;

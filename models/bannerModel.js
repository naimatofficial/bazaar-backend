import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
	{
		bannerType: { type: String, required: true },
		resourceType: {
			type: String,
			enum: ["product", "category", "brand"],
			required: true,
		},
		resourceId: { type: String },
		url: { type: String, required: true },
		bannerImage: { type: String, required: true },
		publish: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;

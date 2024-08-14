import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
	{
		bannerType: {
			type: String,
			required: [true, "Please provide banner type."],
		},
		resourceType: {
			type: String,
			enum: ["product", "category", "brand"],
			required: [true, "Please provide resource type."],
		},
		resourceId: { type: String },
		url: {
			type: String,
			required: [true, "Please provide url."],
			unique: true,
		},
		bannerImage: {
			type: String,
			required: [true, "Please provide banner image"],
		},
		publish: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;

import mongoose from "mongoose";

const flashDealSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Please provide title."],
		},
		startDate: {
			type: Date,
			required: [true, "Please provide start date."],
		},
		endDate: {
			type: Date,
			required: [true, "Please provide end date."],
		},
		image: {
			type: String,
			required: [true, "Please provide image."],
		},
		status: {
			type: String,
			enum: ["active", "expired", "inactive"],
			default: "inactive",
		},
		publish: {
			type: Boolean,
			default: false,
		},
		activeProducts: {
			type: Number,
			default: 0, // Initially, no products are active in the flash deal
		},
		products: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
		],
	},
	{ timestamps: true }
);

const FlashDeal = mongoose.model("FlashDeal", flashDealSchema);

export default FlashDeal;

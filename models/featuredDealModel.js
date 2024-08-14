import mongoose from "mongoose";

const featuredDealSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ["active", "inactive", "expired"],
			default: "inactive",
		},
		products: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
		],
		activeProducts: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

featuredDealSchema.pre(/^find/, function (next) {
	this.populate({
		path: "products",
		select: "-__v -createdAt -updatedAt",
	});
	next();
});

const FeaturedDeal = mongoose.model("FeaturedDeal", featuredDealSchema);
export default FeaturedDeal;

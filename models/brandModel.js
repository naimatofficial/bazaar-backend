import mongoose from "mongoose";
import slugify from "slugify";

const brandSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please provide brand."],
			unique: true,
		},

		thumbnail: { type: String },
		imageAltText: {
			type: String,
			required: [true, "Please provide image alt text."],
		},
		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "inactive",
		},
		slug: String,
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
	}
);

// Virtual to count products associated with the brand
brandSchema.virtual("productCount", {
	ref: "Product",
	localField: "_id",
	foreignField: "brand",
	// This tells mongoose to return a count instead of the documents
	count: true,
});

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;

import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please provide category name."],
			unique: true,
		},
		logo: {
			type: String,
			required: [true, "Please provide category logo."],
		},
		priority: Number,
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
	}
);

// Virtual to count products associated with the category
categorySchema.virtual("productCount", {
	ref: "Product",
	localField: "_id",
	foreignField: "category",
	// This tells mongoose to return a count instead of the documents
	count: true,
});

categorySchema.virtual("slug").get(function () {
	return slugify(this.name, { lower: true });
});

const Category = mongoose.model("Category", categorySchema);

export default Category;

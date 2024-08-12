import mongoose from "mongoose";
import slugify from "slugify";

const subCategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please provide sub category name."],
			unique: true,
		},
		mainCategory: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, "Please provide main category."],
			ref: "Category",
		},
		priority: Number,
		slug: String,
	},
	{
		timestamps: true,
	}
);

subCategorySchema.pre(/^find/, function (next) {
	this.populate({
		path: "mainCategory",
		select: "-__v -createdAt -updatedAt",
		populate: {
			path: "name",
		},
	});
	next();
});

subCategorySchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

export default SubCategory;

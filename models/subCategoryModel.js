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
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
	}
);

subCategorySchema.virtual("slug").get(function () {
	return slugify(this.name, { lower: true });
});

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

const SubCategory = mongoose.model("SubCategory", subCategorySchema);

export default SubCategory;

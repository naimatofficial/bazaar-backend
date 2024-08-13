import mongoose from "mongoose";
import slugify from "slugify";

const subSubCategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please provide sub sub category name."],
			unique: true,
		},
		mainCategory: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, "Please provide main category."],
			ref: "Category",
		},
		subCategory: {
			type: mongoose.Schema.Types.ObjectId,
			required: [true, "Please provide sub category."],
			ref: "SubCategory",
		},
		priority: Number,
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true,
	}
);

subSubCategorySchema.virtual("slug").get(function () {
	return slugify(this.name, { lower: true });
});

subSubCategorySchema.pre(/^find/, function (next) {
	this.populate({
		path: "mainCategory subCategory",
		select: "-__v -createdAt -updatedAt -mainCategory",
		populate: {
			path: "name",
		},
	});
	next();
});

subSubCategorySchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

const SubSubCategory = mongoose.model("SubSubCategory", subSubCategorySchema);

export default SubSubCategory;

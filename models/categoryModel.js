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

categorySchema.pre("save", function (next) {
	if (this.isModified("name")) {
		this.slug = slugify(this.name, { lower: true });
		console.log(`Slug updated to: ${this.slug}`);
	}
	next();
});

categorySchema.pre("findByIdAndUpdate", function (next) {
	const update = this.getUpdate();
	if (update.name) {
		update.slug = slugify(update.name, { lower: true });
		this.setUpdate(update);
		console.log(`Slug updated to: ${update.slug}`);
	}
	next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;

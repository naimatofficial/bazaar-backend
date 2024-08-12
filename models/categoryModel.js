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
		slug: String,
	},
	{
		timestamps: true,
	}
);

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

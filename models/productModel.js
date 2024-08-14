import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
	{
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Customer",
			required: true,
		},
		reviewText: { type: String, required: true },
		rating: { type: Number, required: true, min: 1, max: 5 },
		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "active",
		},
	},
	{ timestamps: true }
);

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Product name is required"],
		},
		description: {
			type: String,
			required: [true, "Product description is required"],
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			// required: [true, "Category is required"]
		},
		subCategory: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "SubCategory",
		},
		subSubCategory: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "SubSubCategory",
		},
		brand: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Brand",
			// required: [true, "Brand is required"]
		},
		productType: {
			type: String,
			required: [true, "Product type is required"],
		},
		digitalProductType: {
			type: String,
		},
		sku: {
			type: String,
			required: [true, "SKU is required"],
		},
		unit: {
			type: String,
			required: [true, "Unit is required"],
		},
		tags: [String],
		price: {
			type: Number,
			required: [true, "Price is required"],
		},
		discount: {
			type: Number,
		},
		discountType: {
			type: String,
			enum: ["percent", "flat"],
		},
		discountAmount: {
			type: Number,
		},

		taxAmount: {
			type: Number,
		},
		taxIncluded: {
			type: Boolean,
			required: [true, "Tax inclusion status is required"],
		},
		shippingCost: {
			type: Number,
		},
		minimumOrderQty: {
			type: Number,
			required: [true, "Minimum order quantity is required"],
		},
		stock: {
			type: Number,
			required: [true, "Stock is required"],
		},
		isFeatured: {
			type: Boolean,
			default: false,
		},
		colors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Color" }],
		attributes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attribute" }],
		thumbnail: String,
		images: [String],
		videoLink: {
			type: String,
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
		},
		userId: { type: mongoose.Schema.Types.ObjectId, required: true },
		userType: {
			type: String,
			enum: ["vendor", "admin"],
			required: true,
		},
		reviews: [reviewSchema],
	},
	{
		timestamps: true,
	}
);

productSchema.pre(/^find/, function (next) {
	this.populate({
		path: "category",
		select: "name",
	})
		.populate({
			path: "brand",
			select: "name",
		})
		.populate({
			path: "subCategory",
			select: "name",
		})
		.populate({
			path: "subSubCategory",
			select: "name",
		});
	next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;

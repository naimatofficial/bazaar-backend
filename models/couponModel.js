import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required."],
		},
		code: {
			type: String,
			required: [true, "Code is required."],
			unique: true,
			trim: true,
		},
		type: {
			type: String,
			enum: [
				"Discount on Purchase",
				"Free Delivery",
				"Buy One Get One",
				"Others",
			],
			required: [true, "Type is required."],
		},

		userLimit: {
			limit: {
				type: Number,
				required: [true, "Limit is required."],
				min: [0, "Limit cannot be negative."],
			},
			used: {
				type: Number,
				default: 0,
				min: [0, "Used count cannot be negative."],
			},
		},
		discountBearer: {
			type: String,
			enum: ["Vendor", "Customer", "Admin"],
			required: [true, "Discount Bearer is required."],
		},
		discountType: {
			type: String,
			enum: ["Amount", "Percentage"],
			required: [true, "Discount Type is required."],
		},
		discountAmount: {
			type: Number,
			required: [true, "Discount Amount is required."],
			min: [0, "Discount Amount cannot be negative."],
		},
		minPurchase: {
			type: Number,
			required: [true, "Minimum Purchase is required."],
			min: [0, "Minimum Purchase cannot be negative."],
		},
		maxDiscount: {
			type: Number,
			required: [true, "Maximum Discount is required."],
			min: [0, "Maximum Discount cannot be negative."],
		},
		startDate: {
			type: Date,
			required: [true, "Start Date is required."],
		},
		expireDate: {
			type: Date,
			required: [true, "Expire Date is required."],
		},
		status: {
			type: String,
			enum: ["Active", "Inactive"],
			default: "Active",
		},
		applicableProducts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
		],
		applicableVendors: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Vendor",
			},
		],
		applicableCustomers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Customer",
			},
		],
	},
	{
		timestamps: true,
	}
);

// Pre middleware to populate applicableProducts, applicableVendors,
// and applicableCustomers before any find operation
couponSchema.pre(/^find/, function (next) {
	this.populate("applicableProducts")
		.populate("applicableVendors")
		.populate("applicableCustomers");
	next();
});

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;

import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	phoneNumber: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},

	shopName: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},

	status: {
		type: String,
		enum: ["pending", "active", "rejected"],
		default: "pending",
	},
	vendorImage: {
		type: String,
	},
	logo: {
		type: String,
	},
	banner: {
		type: String,
	},
	role: {
		type: String,
		default: "vendor",
	},
});

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;

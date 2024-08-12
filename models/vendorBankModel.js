import mongoose from "mongoose";

const vendorBankSchema = new mongoose.Schema(
	{
		vendorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Vendor",
			required: true,
			unique: true,
		},
		holderName: {
			type: String,
			required: [true, "Please provide holder name."],
		},
		bankName: {
			type: String,
			required: [true, "Please provide bank name."],
		},
		branch: {
			type: String,
			required: [true, "Please provide branch name."],
		},
		accountNumber: {
			type: String,
			required: [true, "Please provide account number."],
			unique: true,
		},
	},
	{
		timestamps: true,
	}
);

const VendorBank = mongoose.model("VendorBank", vendorBankSchema);

export default VendorBank;

import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please tell us your name."],
		},
		email: {
			type: String,
			required: [true, "Please provide your email address."],
			unique: true,
			lowercase: true,
			validate: [validator.isEmail, "Please provide a valid email address."],
		},
		phoneNumber: {
			type: String,
			unique: true,
		},
		image: {
			type: String,
		},
		role: {
			type: String,
			enum: ["admin", "user"],
			default: "user",
		},
		password: {
			type: String,
			required: [true, "Please provide a password."],
			minlength: 8,
			select: false,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre("save", async function (next) {
	// Only work when the password is not modified
	if (!this.isModified("password")) return next();

	// Hash the password using cost of 12
	this.password = await bcrypt.hash(this.password, 12);

	next();
});

const User = mongoose.model("User", userSchema);

export default User;

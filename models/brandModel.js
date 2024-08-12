import mongoose from "mongoose";
import slugify from "slugify";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide brand."],
      unique: true,
    },
 
	thumbnail: { type: String },
    imageAltText: {
      type: String,
      required: [true, "Please provide image alt text."],
    },
    status: {
			type: String,
			enum: ["active", "inactive"],
			default: "inactive",
		},
    slug: String,
  },
  {
    timestamps: true,
  }
);


const Brand = mongoose.model("Brand", brandSchema);

export default Brand;

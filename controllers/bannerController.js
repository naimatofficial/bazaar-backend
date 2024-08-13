import Banner from "../models/bannerModel.js";
import { deleteOne, getAll, getOne } from "./handleFactory.js";

// Create a new banner
export const createBanner = async (req, res) => {
	try {
		const { bannerType, resourceType, resourceId, url, publish } = req.body;
		const bannerImage = req.file ? req.file.path : null;

		const banner = new Banner({
			bannerType,
			resourceType,
			resourceId,
			url,
			bannerImage,
			publish,
		});
		await banner.save();
		res.status(201).json(banner);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

// Get all banners
export const getBanners = getAll(Banner);
// Update a banner (including publish field and banner image)
export const updateBanner = async (req, res) => {
	try {
		const { id } = req.params;
		const { bannerType, resourceType, resourceId, url, publish } = req.body;
		const bannerImage = req.file ? req.file.path : null;

		const updatedFields = {
			bannerType,
			resourceType,
			resourceId,
			url,
			publish,
		};
		if (bannerImage) {
			updatedFields.bannerImage = bannerImage;
		}

		const banner = await Banner.findByIdAndUpdate(id, updatedFields, {
			new: true,
		});
		if (!banner) {
			return res.status(404).json({ message: "Banner not found" });
		}
		res.status(200).json(banner);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

// Delete a banner
export const deleteBanner = deleteOne(Banner);

// Get a banner by ID
export const getBannerById = getOne(Banner);

// controllers/bannerController.js
import Banner from '../models/bannerModel.js';

// Create a new banner
export const createBanner = async (req, res) => {
    try {
        const { bannerType, resourceType, resourceId, url, publish } = req.body;
        const bannerImage = req.file ? req.file.path : null;

        const banner = new Banner({ bannerType, resourceType, resourceId, url, bannerImage, publish });
        await banner.save();
        res.status(201).json(banner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all banners
export const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find();
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a banner (including publish field and banner image)
export const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { bannerType, resourceType, resourceId, url, publish } = req.body;
        const bannerImage = req.file ? req.file.path : null;

        const updatedFields = { bannerType, resourceType, resourceId, url, publish };
        if (bannerImage) {
            updatedFields.bannerImage = bannerImage;
        }

        const banner = await Banner.findByIdAndUpdate(id, updatedFields, { new: true });
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.status(200).json(banner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a banner
export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByIdAndDelete(id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.status(200).json({ message: 'Banner deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update the publish status of a banner
export const updatePublishStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { publish } = req.body;

        const banner = await Banner.findByIdAndUpdate(id, { publish }, { new: true });
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.status(200).json(banner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Get a banner by ID
export const getBannerById = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findById(id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.status(200).json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

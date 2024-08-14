import FeaturedDeal from "../models/featuredDealModel.js";
import Product from "../models/productModel.js";
import {
	sendErrorResponse,
	sendSuccessResponse,
} from "../utils/responseHandler.js";
import { getCache, setCache, deleteCache } from "../utils/redisUtils.js";
import logger from "../utils/logger.js";

// Function to check expiration status
const checkExpiration = (featuredDeal) => {
	const currentDate = new Date();
	const endDate = new Date(featuredDeal.endDate);
	return currentDate > endDate;
};

// Create Feature Deal
export const createFeaturedDeal = async (req, res) => {
	try {
		const { title, startDate, endDate } = req.body;
		const newFeaturedDeal = new FeaturedDeal({
			title,
			startDate,
			endDate,
			status: "inactive",
		});

		await newFeaturedDeal.save();
		await setCache(`featuredDeal_${newFeaturedDeal._id}`, newFeaturedDeal);

		await deleteCache("featuredDeals");

		res.status(201).json({
			message: "Featured deal created successfully",
			featuredDeal: newFeaturedDeal,
		});
	} catch (error) {
		logger.error(`Error creating featured deal: ${error.message}`);
		sendErrorResponse(res, error);
	}
};

// Get Feature Deals
export const getFeaturedDeals = async (req, res) => {
	try {
		const cacheKey = "featuredDeals";
		const { title, startDate, endDate, status } = req.query;

		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			const filteredData = cachedData.filter((deal) => {
				let matches = true;

				if (title) {
					matches = deal.title.toLowerCase().includes(title.toLowerCase());
				}
				if (status && deal.status !== status) {
					matches = false;
				}
				if (startDate || endDate) {
					const dealStartDate = new Date(deal.startDate);
					const dealEndDate = new Date(deal.endDate);
					const queryStartDate = startDate ? new Date(startDate) : null;
					const queryEndDate = endDate ? new Date(endDate) : null;

					if (queryStartDate && dealStartDate < queryStartDate) {
						matches = false;
					}
					if (queryEndDate && dealEndDate > queryEndDate) {
						matches = false;
					}
				}
				return matches;
			});

			return res.status(200).json({
				success: true,
				message: "Feature deals retrieved successfully (from cache)",
				docs: filteredData,
			});
		}

		const query = {};
		if (title) {
			query.title = { $regex: title, $options: "i" };
		}
		if (status) {
			query.status = status;
		}
		if (startDate || endDate) {
			query.startDate = {};
			if (startDate) {
				query.startDate.$gte = new Date(startDate);
			}
			if (endDate) {
				query.startDate.$lte = new Date(endDate);
			}
		}

		const featuredDeals = await FeaturedDeal.find(query).populate({
			path: "productIds",
			select: "name price description thumbnail",
		});

		for (let deal of featuredDeals) {
			if (checkExpiration(deal)) {
				deal.status = "expired";
				await deal.save();
			}
		}

		await setCache(cacheKey, featuredDeals, 3600);
		res.status(200).json({
			success: true,
			message: "Feature deals retrieved successfully",
			docs: featuredDeals,
		});
	} catch (error) {
		logger.error(`Error retrieving feature deals: ${error.message}`);
		sendErrorResponse(res, error);
	}
};

// Get Feature Deal by ID
export const getFeaturedDealById = async (req, res) => {
	try {
		const { id } = req.params;
		const cacheKey = `featuredDeal_${id}`;
		const cachedData = await getCache(cacheKey);

		if (cachedData) {
			logger.info(`Cache hit for key: ${cacheKey}`);
			return res.status(200).json({
				success: true,
				message: "Feature deal retrieved successfully (from cache)",
				docs: cachedData,
			});
		}

		const featuredDeal = await FeaturedDeal.findById(id).populate({
			path: "productIds",
			select: "name price description thumbnail",
		});

		if (!featuredDeal) {
			logger.warn(`Feature deal with ID ${id} not found in database`);
			return res.status(404).json({ message: "Feature deal not found" });
		}

		if (checkExpiration(featuredDeal)) {
			featuredDeal.status = "expired";
			await featuredDeal.save();
		}

		await setCache(cacheKey, featuredDeal, 3600); // Cache for 1 hour
		logger.info(`Cache set for key: ${cacheKey}`);
		res.status(200).json({
			success: true,
			message: "Feature deal retrieved successfully",
			docs: featuredDeal,
		});
	} catch (error) {
		logger.error(`Error in getFeaturedDealById: ${error.message}`);
		sendErrorResponse(res, error);
	}
};

// Update Feature Deal
export const updateFeaturedDeal = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, startDate, endDate, status } = req.body;
		const updateData = { title, startDate, endDate, status };

		const updatedFeaturedDeal = await FeaturedDeal.findByIdAndUpdate(
			id,
			updateData,
			{ new: true }
		);

		if (checkExpiration(updatedFeaturedDeal)) {
			updatedFeaturedDeal.status = "expired";
			await updatedFeaturedDeal.save();
		}

		await deleteCache(`featuredDeal_${id}`);
		await deleteCache("featuredDeals");

		sendSuccessResponse(
			res,
			updatedFeaturedDeal,
			"Feature deal updated successfully"
		);
	} catch (error) {
		logger.error(`Error updating feature deal: ${error.message}`);
		sendErrorResponse(res, error);
	}
};

// Add Product to Feature Deal
export const addProductToFeaturedDeal = async (req, res) => {
	try {
		const { id } = req.params;
		const { productId } = req.body;

		// Check if the product exists
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		const featuredDeal = await FeaturedDeal.findById(id);
		if (!featuredDeal) {
			return res.status(404).json({ message: "Feature Deal not found" });
		}

		// Add the product to the feature deal if it isn't already included
		if (!featuredDeal.productIds.includes(productId)) {
			featuredDeal.productIds.push(productId);
			featuredDeal.activeProducts = featuredDeal.productIds.length;
			await featuredDeal.save();

			await deleteCache(`featuredDeal_${id}`);
			await deleteCache("featuredDeals");
		}

		res.status(200).json({
			message: "Product added to Feature Deal successfully",
			featuredDeal,
		});
	} catch (error) {
		logger.error(`Error adding product to feature deal: ${error.message}`);
		sendErrorResponse(res, error);
	}
};

// Remove Product from Feature Deal
export const removeProductFromFeaturedDeal = async (req, res) => {
	try {
		const { id } = req.params;
		const { productId } = req.body;

		const featuredDeal = await FeaturedDeal.findById(id);
		if (!featuredDeal) {
			return res.status(404).json({ message: "Feature Deal not found" });
		}

		if (!featuredDeal.productIds.includes(productId)) {
			return res
				.status(400)
				.json({ message: "Product not found in Feature Deal" });
		}

		featuredDeal.productIds = featuredDeal.productIds.filter(
			(pid) => pid.toString() !== productId
		);
		featuredDeal.activeProducts = featuredDeal.productIds.length;

		await featuredDeal.save();
		await deleteCache(`featuredDeal_${id}`);
		await deleteCache("featuredDeals");

		res.status(200).json({
			message: "Product removed from Feature Deal successfully",
			featuredDeal,
		});
	} catch (error) {
		logger.error(`Error removing product from feature deal: ${error.message}`);
		sendErrorResponse(res, error);
	}
};

// Update Feature Deal Status
export const updateFeaturedDealStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		const validStatuses = ["active", "inactive", "expired"];
		if (!validStatuses.includes(status)) {
			return res.status(400).json({ message: "Invalid status" });
		}

		const updatedFeaturedDeal = await FeaturedDeal.findByIdAndUpdate(
			id,
			{ status },
			{ new: true }
		);

		if (!updatedFeaturedDeal) {
			return res.status(404).json({ message: "Feature Deal not found" });
		}

		await deleteCache(`featuredDeal_${id}`);
		await deleteCache("featuredDeals");

		sendSuccessResponse(
			res,
			updatedFeaturedDeal,
			"Feature Deal status updated successfully"
		);
	} catch (error) {
		logger.error(`Error updating feature deal status: ${error.message}`);
		sendErrorResponse(res, error);
	}
};

// Update Publish Status
export const updatePublishStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { publish } = req.body;

		if (publish !== true && publish !== false) {
			return res.status(400).json({ message: "Invalid publish status" });
		}

		const featuredDeal = await FeaturedDeal.findById(id);
		if (!featuredDeal) {
			return res.status(404).json({ message: "Feature Deal not found" });
		}

		featuredDeal.isPublished = publish;
		await featuredDeal.save();

		await deleteCache(`featuredDeal_${id}`);
		await deleteCache("featuredDeals");

		res.status(200).json({
			message: "Feature Deal publish status updated successfully",
			featuredDeal,
		});
	} catch (error) {
		logger.error(`Error updating publish status: ${error.message}`);
		sendErrorResponse(res, error);
	}
};

// Delete Feature Deal
export const deleteFeaturedDeal = async (req, res) => {
	try {
		const { id } = req.params;

		// Delete the feature deal from the database
		const featuredDeal = await FeaturedDeal.findByIdAndDelete(id);

		if (!featuredDeal) {
			return res.status(404).json({ message: "Feature Deal not found" });
		}

		// Invalidate the cache for the deleted feature deal and all feature deals
		await deleteCache(`featuredDeal_${id}`);
		await deleteCache("featuredDeals");

		res.status(200).json({ message: "Feature Deal deleted successfully" });
	} catch (error) {
		logger.error(`Error deleting feature deal: ${error.message}`);
		res.status(500).json({ message: error.message });
	}
};

export const deleteProductFromFeaturedDeal = async (req, res) => {
	try {
		const { id, productId } = req.params;

		const featuredDeal = await FeaturedDeal.findById(id);
		if (!featuredDeal) {
			return res.status(404).json({ message: "Feature Deal not found" });
		}

		// Remove the product from the feature deal
		if (!featuredDeal.productIds.includes(productId)) {
			return res
				.status(400)
				.json({ message: "Product not found in Feature Deal" });
		}

		featuredDeal.productIds = featuredDeal.productIds.filter(
			(pid) => pid.toString() !== productId
		);
		featuredDeal.activeProducts = featuredDeal.productIds.length;

		await featuredDeal.save();

		await deleteCache(`featuredDeal_${id}`);
		await deleteCache("featuredDeals");

		res.status(200).json({
			message: "Product removed from Feature Deal successfully",
			featuredDeal,
		});
	} catch (error) {
		logger.error(`Error removing product from feature deal: ${error.message}`);
		res.status(500).json({ message: error.message });
	}
};

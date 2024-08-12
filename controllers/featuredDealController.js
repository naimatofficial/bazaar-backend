


import FeatureDeal from '../models/featuredDealModel.js';
import Product from '../models/ProductModels.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responseHandler.js';
import { getCache, setCache, deleteCache } from '../utils/redisUtils.js'; 
import logger from '../utils/logger.js';

// Function to check expiration status
const checkExpiration = (featureDeal) => {
    const currentDate = new Date();
    const endDate = new Date(featureDeal.endDate);
    return currentDate > endDate; 
};

// Create Feature Deal
export const createFeatureDeal = async (req, res) => {
    try {
        const { title, startDate, endDate } = req.body;
        const newFeatureDeal = new FeatureDeal({
            title,
            startDate,
            endDate,
            status: 'inactive',
        });

        await newFeatureDeal.save();
        await setCache(`featureDeal_${newFeatureDeal._id}`, newFeatureDeal);

        await deleteCache('featureDeals');

        res.status(201).json({ message: 'Feature deal created successfully', featureDeal: newFeatureDeal });
    } catch (error) {
        logger.error(`Error creating feature deal: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

// Get Feature Deals
export const getFeatureDeals = async (req, res) => {
    try {
        const cacheKey = 'featureDeals';
        const { title, startDate, endDate, status } = req.query;

        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            const filteredData = cachedData.filter(deal => {
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
                message: 'Feature deals retrieved successfully (from cache)',
                docs: filteredData,
            });
        }

        const query = {};
        if (title) {
            query.title = { $regex: title, $options: 'i' };
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

        const featureDeals = await FeatureDeal.find(query).populate({
            path: 'productIds',
            select: 'name price description thumbnail',
        });

        for (let deal of featureDeals) {
            if (checkExpiration(deal)) {
                deal.status = 'expired';
                await deal.save();
            }
        }

        await setCache(cacheKey, featureDeals, 3600);
        res.status(200).json({
            success: true,
            message: 'Feature deals retrieved successfully',
            docs: featureDeals,
        });
    } catch (error) {
        logger.error(`Error retrieving feature deals: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

// Get Feature Deal by ID
export const getFeatureDealById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `featureDeal_${id}`;
        const cachedData = await getCache(cacheKey);

        if (cachedData) {
            logger.info(`Cache hit for key: ${cacheKey}`);
            return res.status(200).json({
                success: true,
                message: 'Feature deal retrieved successfully (from cache)',
                docs: cachedData,
            });
        }

        const featureDeal = await FeatureDeal.findById(id).populate({
            path: 'productIds',
            select: 'name price description thumbnail',
        });

        if (!featureDeal) {
            logger.warn(`Feature deal with ID ${id} not found in database`);
            return res.status(404).json({ message: 'Feature deal not found' });
        }

        if (checkExpiration(featureDeal)) {
            featureDeal.status = 'expired';
            await featureDeal.save();
        }

        await setCache(cacheKey, featureDeal, 3600); // Cache for 1 hour
        logger.info(`Cache set for key: ${cacheKey}`);
        res.status(200).json({
            success: true,
            message: 'Feature deal retrieved successfully',
            docs: featureDeal,
        });
    } catch (error) {
        logger.error(`Error in getFeatureDealById: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

// Update Feature Deal
export const updateFeatureDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, startDate, endDate, status } = req.body;
        const updateData = { title, startDate, endDate, status };

        const updatedFeatureDeal = await FeatureDeal.findByIdAndUpdate(id, updateData, { new: true });

        if (checkExpiration(updatedFeatureDeal)) {
            updatedFeatureDeal.status = 'expired';
            await updatedFeatureDeal.save();
        }

        await deleteCache(`featureDeal_${id}`);
        await deleteCache('featureDeals');

        sendSuccessResponse(res, updatedFeatureDeal, 'Feature deal updated successfully');
    } catch (error) {
        logger.error(`Error updating feature deal: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

// Add Product to Feature Deal
export const addProductToFeatureDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId } = req.body;

        // Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const featureDeal = await FeatureDeal.findById(id);
        if (!featureDeal) {
            return res.status(404).json({ message: 'Feature Deal not found' });
        }

        // Add the product to the feature deal if it isn't already included
        if (!featureDeal.productIds.includes(productId)) {
            featureDeal.productIds.push(productId);
            featureDeal.activeProducts = featureDeal.productIds.length;
            await featureDeal.save();

            await deleteCache(`featureDeal_${id}`);
            await deleteCache('featureDeals');
        }

        res.status(200).json({ message: 'Product added to Feature Deal successfully', featureDeal });
    } catch (error) {
        logger.error(`Error adding product to feature deal: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

// Remove Product from Feature Deal
export const removeProductFromFeatureDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId } = req.body;

        const featureDeal = await FeatureDeal.findById(id);
        if (!featureDeal) {
            return res.status(404).json({ message: 'Feature Deal not found' });
        }

        if (!featureDeal.productIds.includes(productId)) {
            return res.status(400).json({ message: 'Product not found in Feature Deal' });
        }

        featureDeal.productIds = featureDeal.productIds.filter(pid => pid.toString() !== productId);
        featureDeal.activeProducts = featureDeal.productIds.length;

        await featureDeal.save();
        await deleteCache(`featureDeal_${id}`);
        await deleteCache('featureDeals');

        res.status(200).json({ message: 'Product removed from Feature Deal successfully', featureDeal });
    } catch (error) {
        logger.error(`Error removing product from feature deal: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

// Update Feature Deal Status
export const updateFeatureDealStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['active', 'inactive', 'expired'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedFeatureDeal = await FeatureDeal.findByIdAndUpdate(id, { status }, { new: true });

        if (!updatedFeatureDeal) {
            return res.status(404).json({ message: 'Feature Deal not found' });
        }

        await deleteCache(`featureDeal_${id}`);
        await deleteCache('featureDeals');

        sendSuccessResponse(res, updatedFeatureDeal, 'Feature Deal status updated successfully');
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
            return res.status(400).json({ message: 'Invalid publish status' });
        }

        const featureDeal = await FeatureDeal.findById(id);
        if (!featureDeal) {
            return res.status(404).json({ message: 'Feature Deal not found' });
        }

        featureDeal.isPublished = publish;
        await featureDeal.save();

        await deleteCache(`featureDeal_${id}`);
        await deleteCache('featureDeals');

        res.status(200).json({ message: 'Feature Deal publish status updated successfully', featureDeal });
    } catch (error) {
        logger.error(`Error updating publish status: ${error.message}`);
        sendErrorResponse(res, error);
    }
};


// Delete Feature Deal
export const deleteFeatureDeal = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the feature deal from the database
        const featureDeal = await FeatureDeal.findByIdAndDelete(id);

        if (!featureDeal) {
            return res.status(404).json({ message: 'Feature Deal not found' });
        }

        // Invalidate the cache for the deleted feature deal and all feature deals
        await deleteCache(`featureDeal_${id}`);
        await deleteCache('featureDeals');

        res.status(200).json({ message: 'Feature Deal deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting feature deal: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

export const deleteProductFromFeatureDeal = async (req, res) => {
    try {
        const { id, productId } = req.params;

        const featureDeal = await FeatureDeal.findById(id);
        if (!featureDeal) {
            return res.status(404).json({ message: 'Feature Deal not found' });
        }

        // Remove the product from the feature deal
        if (!featureDeal.productIds.includes(productId)) {
            return res.status(400).json({ message: 'Product not found in Feature Deal' });
        }

        featureDeal.productIds = featureDeal.productIds.filter(pid => pid.toString() !== productId);
        featureDeal.activeProducts = featureDeal.productIds.length;

        await featureDeal.save();

        await deleteCache(`featureDeal_${id}`);
        await deleteCache('featureDeals');

        res.status(200).json({ message: 'Product removed from Feature Deal successfully', featureDeal });
    } catch (error) {
        logger.error(`Error removing product from feature deal: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};
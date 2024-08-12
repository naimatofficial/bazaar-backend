import Brand from '../models/brandModel.js';
import { client } from '../utils/redisClient.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

// Create a new brand
export const createBrand = async (req, res) => {
    try {
        const { name, imageAltText } = req.body;
        const thumbnail = req.file ? req.file.path : undefined;

        const newBrand = new Brand({
            name,
            thumbnail,
            imageAltText,
        });

        const savedBrand = await newBrand.save();

        if (savedBrand) {
            // Cache the new brand
            const cacheKey = `brand:${savedBrand._id}`;
            await client.set(cacheKey, JSON.stringify(savedBrand));
            console.log(`[CACHE] Cached new brand with key: ${cacheKey}`);

            // Invalidate the all brands cache
            await client.del('all_brands');
            console.log(`[CACHE] Invalidated cache for all brands`);

            sendSuccessResponse(res, savedBrand, 'Brand created successfully');
        } else {
            throw new Error('Brand could not be created');
        }
    } catch (error) {
        console.error(`[ERROR] Error creating brand: ${error.message}`);
        sendErrorResponse(res, error);
    }
};


// Get all brands with optional search and status filter
export const getBrands = async (req, res) => {
    try {
        const { name, status } = req.query;
        const cacheKey = `all_brands${name ? `:name:${name}` : ''}${status ? `:status:${status}` : ''}`;

        // Check cache first
        let cacheData = await client.get(cacheKey);
        if (cacheData) {
            try {
                cacheData = JSON.parse(cacheData);
                if (Array.isArray(cacheData)) {
                    console.log(`[CACHE] Retrieved brands from cache with key: ${cacheKey}`);
                    return sendSuccessResponse(res, cacheData, 'Brands fetched successfully');
                }
            } catch (error) {
                console.error(`[CACHE] Error parsing cached data: ${error.message}`);
            }
        }

        // Fetch from the database
        const searchCriteria = {};
        if (name) {
            searchCriteria.name = new RegExp(name, 'i');
        }
        if (status) {
            searchCriteria.status = status;
        }

        const brands = await Brand.find(searchCriteria);

        // Cache the result
        if (brands && brands.length > 0) {
            await client.set(cacheKey, JSON.stringify(brands));
            console.log(`[CACHE] Cached brands with key: ${cacheKey}`);
        } else {
            console.log(`[DB] No brands found for search criteria.`);
        }

        sendSuccessResponse(res, brands, 'Brands fetched successfully');
    } catch (error) {
        console.error(`[ERROR] Error fetching brands: ${error.message}`);
        sendErrorResponse(res, error);
    }
};




// Get a brand by ID
export const getBrandById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `brand:${id}`;

        // Check cache first
        let brand = await client.get(cacheKey);
        if (brand) {
            brand = JSON.parse(brand);
        } else {
            // Fetch from the database
            brand = await Brand.findById(id);
            if (brand) {
                // Cache the result
                await client.set(cacheKey, JSON.stringify(brand));
            } else {
                return res.status(404).json({ message: 'Brand not found' });
            }
        }

        sendSuccessResponse(res, brand, 'Brand fetched successfully');
    } catch (error) {
        console.error(`[ERROR] Error fetching brand: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

// Update a brand by ID
export const updateBrand = async (req, res) => {
    try {
        const { name, imageAltText } = req.body;
        const thumbnail = req.file ? req.file.path : undefined;

        const updatedBrand = await Brand.findByIdAndUpdate(
            req.params.id,
            { name, thumbnail, imageAltText },
            { new: true }
        );

        if (updatedBrand) {
            // Update the cache
            const cacheKey = `brand:${updatedBrand._id}`;
            await client.set(cacheKey, JSON.stringify(updatedBrand));
            console.log(`[CACHE] Updated cache for brand with key: ${cacheKey}`);

            // Invalidate the all brands cache
            await client.del('all_brands');
            console.log(`[CACHE] Invalidated cache for all brands`);

            sendSuccessResponse(res, updatedBrand, 'Brand updated successfully');
        } else {
            res.status(404).json({ message: 'Brand not found' });
        }
    } catch (error) {
        console.error(`[ERROR] Error updating brand: ${error.message}`);
        sendErrorResponse(res, error);
    }
};




// Delete a brand by ID
export const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBrand = await Brand.findByIdAndDelete(id);
        if (deletedBrand) {
            // Remove from cache
            const cacheKey = `brand:${id}`;
            await client.del(cacheKey);
            console.log(`[CACHE] Removed cache for brand with key: ${cacheKey}`);

            // Invalidate the all brands cache
            await client.del('all_brands');
            console.log(`[CACHE] Invalidated cache for all brands`);

            sendSuccessResponse(res, { message: 'Brand deleted successfully' }, 'Brand deleted successfully');
        } else {
            res.status(404).json({ message: 'Brand not found' });
        }
    } catch (error) {
        console.error(`[ERROR] Error deleting brand: ${error.message}`);
        sendErrorResponse(res, error);
    }
};



// Update a brand's status by ID
export const updateBrandStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Ensure the status is valid
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Update the brand's status
        const updatedBrand = await Brand.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedBrand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        // Update the cache
        const cacheKey = `brand:${updatedBrand._id}`;
        await client.set(cacheKey, JSON.stringify(updatedBrand));
        console.log(`[CACHE] Updated cache for brand with key: ${cacheKey}`);

        // Invalidate the all brands cache
        await client.del('all_brands');
        console.log(`[CACHE] Invalidated cache for all brands`);

        sendSuccessResponse(res, updatedBrand, 'Brand status updated successfully');
    } catch (error) {
        console.error(`[ERROR] Error updating brand status: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

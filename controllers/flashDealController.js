import FlashDeal from '../models/flashDealModel.js'
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../utils/responseHandler.js'
import { getCache, setCache, deleteCache } from '../utils/redisUtils.js'
import logger from '../utils/logger.js'
import Product from '../models/productModel.js'
import { deleteOne } from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'

const checkExpiration = (flashDeal) => {
    const currentDate = new Date()
    const endDate = new Date(flashDeal.endDate)
    return currentDate > endDate
}

// Create Flash Deal
export const createFlashDeal = async (req, res) => {
    try {
        const { title, startDate, endDate } = req.body
        const image = req.file ? req.file.path : ''

        const newFlashDeal = new FlashDeal({
            title,
            startDate,
            endDate,
            image,
            status: 'inactive',
        })

        await newFlashDeal.save()
        await setCache(`flashDeal_${newFlashDeal._id}`, newFlashDeal)

        res.status(201).json({
            message: 'Flash deal created successfully',
            flashDeal: newFlashDeal,
        })
    } catch (error) {
        logger.error(`Error creating flash deal: ${error.message}`)
        res.status(500).json({ message: 'Internal server error' })
    }
}

// Get Flash Deals with Caching
export const getFlashDeals = async (req, res) => {
    try {
        const cacheKey = 'flashDeals'
        const cachedData = await getCache(cacheKey)

        if (cachedData) {
            return res.status(200).json({
                success: true,
                message: 'Flash deals retrieved successfully (from cache)',
                docs: cachedData,
            })
        }

        const flashDeals = await FlashDeal.find().populate({
            path: 'products',
            select: 'name price description thumbnail',
        })

        for (let deal of flashDeals) {
            if (checkExpiration(deal)) {
                deal.status = 'expired'
                await deal.save()
            }
        }

        await setCache(cacheKey, flashDeals, 3600)
        res.status(200).json({
            success: true,
            message: 'Flash deals retrieved successfully',
            docs: flashDeals,
        })
    } catch (error) {
        logger.error(error.message)
        res.status(500).json({ message: error.message })
    }
}

// Get Flash Deal by ID
export const getFlashDealById = async (req, res) => {
    try {
        const { id } = req.params

        const cacheKey = `flashDeal_${id}`
        const cachedData = await getCache(cacheKey)

        if (cachedData) {
            logger.info(`Cache hit for key: ${cacheKey}`)
            return res.status(200).json({
                success: true,
                message: 'Flash deal retrieved successfully (from cache)',
                docs: cachedData,
            })
        }

        const flashDeal = await FlashDeal.findById(id).populate({
            path: 'productId',
            select: 'name price description thumbnail',
        })

        if (!flashDeal) {
            logger.warn(`Flash deal with ID ${id} not found in database`)
            return res.status(404).json({ message: 'Flash deal not found' })
        }

        if (checkExpiration(flashDeal)) {
            flashDeal.status = 'expired'
            await flashDeal.save()
        }

        await setCache(cacheKey, flashDeal, 3600)
        logger.info(`Cache set for key: ${cacheKey}`)
        res.status(200).json({
            success: true,
            message: 'Flash deal retrieved successfully',
            docs: flashDeal,
        })
    } catch (error) {
        logger.error(`Error in getFlashDealById: ${error.message}`)
        res.status(500).json({ message: error.message })
    }
}

export const updateFlashDeal = async (req, res) => {
    try {
        const { id } = req.params

        const { error } = flashDealValidationSchema.validate(req.body)
        if (error) {
            return res.status(400).json({ message: error.details[0].message })
        }

        const updatedFlashDeal = await FlashDeal.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
            }
        ).exec()

        if (!updatedFlashDeal) {
            return res.status(404).json({ message: 'Flash deal not found' })
        }

        if (checkExpiration(updatedFlashDeal)) {
            updatedFlashDeal.status = 'expired'
            await updatedFlashDeal.save()
        }

        await deleteCache(`flashDeal_${id}`)
        await deleteCache('flashDeals')

        sendSuccessResponse(
            res,
            updatedFlashDeal,
            'Flash deal updated successfully'
        )
    } catch (error) {
        logger.error(error.message)
        sendErrorResponse(res, error)
    }
}

// Delete Flash Deal
export const deleteFlashDeal = deleteOne(FlashDeal)
// Add Product to Flash Deal
export const addProductToFlashDeal = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { products } = req.body

    const flashDeal = await FlashDeal.findById(id)
    if (!flashDeal) {
        return next(new AppError('No document found with that ID', 404))
    }

    flashDeal.products = products

    await flashDeal.save()

    // Update cache
    const cacheKey = getCacheKey(FlashDeal, '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc,
    })
})
// Remove Product from Flash Deal
export const removeProductFromFlashDeal = async (req, res) => {
    try {
        const { id, productId } = req.params // Flash Deal ID

        if (!id || !productId) {
            return res
                .status(400)
                .json({ message: 'Flash Deal ID and Product ID are required' })
        }

        const flashDeal = await FlashDeal.findById(id)
        if (!flashDeal) {
            return res.status(404).json({ message: 'Flash Deal not found' })
        }

        if (!flashDeal.productId.includes(productId)) {
            return res
                .status(400)
                .json({ message: 'Product not found in Flash Deal' })
        }

        // Remove product from the Flash Deal
        flashDeal.productId = flashDeal.productId.filter(
            (pid) => pid.toString() !== productId
        )
        flashDeal.activeProducts -= 1

        // Save updated Flash Deal
        await flashDeal.save()

        // Invalidate cache
        await deleteCache(`flashDeal_${id}`)
        await deleteCache('flashDeals')

        sendSuccessResponse(
            res,
            flashDeal,
            'Product removed from Flash Deal successfully'
        )
    } catch (error) {
        logger.error(`Error removing product from Flash Deal: ${error.message}`)
        sendErrorResponse(res, error)
    }
}

// Update Flash Deal Status
export const updateFlashDealStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        // Validate status
        if (!['active', 'inactive', 'expired'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' })
        }

        // Update flash deal status
        const updatedFlashDeal = await FlashDeal.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        )

        if (!updatedFlashDeal) {
            return res.status(404).json({ message: 'Flash deal not found' })
        }

        // Invalidate cache
        await deleteCache(`flashDeal_${id}`)
        await deleteCache('flashDeals')

        sendSuccessResponse(
            res,
            updatedFlashDeal,
            'Flash deal status updated successfully'
        )
    } catch (error) {
        logger.error(`Error updating flash deal status: ${error.message}`)
        sendErrorResponse(res, error)
    }
}

// Update Publish Status of Flash Deal
export const updatePublishStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { publish } = req.body

        // Validate publish status (true/false)
        if (typeof publish !== 'boolean') {
            return res.status(400).json({ message: 'Invalid publish status' })
        }

        // Update the publish status
        const updatedFlashDeal = await FlashDeal.findByIdAndUpdate(
            id,
            { publish },
            { new: true }
        ).exec()
        if (!updatedFlashDeal) {
            return res.status(404).json({ message: 'Flash deal not found' })
        }

        // Invalidate cache
        await deleteCache(`flashDeal_${id}`)
        await deleteCache('flashDeals')

        res.status(200).json({
            message: 'Publish status updated successfully',
            flashDeal: updatedFlashDeal,
        })
    } catch (error) {
        logger.error(error.message)
        res.status(500).json({ message: error.message })
    }
}

import Refund from '../models/refundModel.js'
import Order from '../models/orderModel.js'
import mongoose from 'mongoose'
import {
    sendSuccessResponse,
    sendErrorResponse,
} from '../utils/responseHandler.js'
import { createOne, deleteOne, getAll, getOne } from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'
import AppError from '../utils/appError.js'

const populateOrderDetails = (query) => {
    return query.populate({
        path: 'order',
        populate: [
            {
                path: 'customer',
                select: 'firstName lastName email phoneNumber role referCode status',
            },
            {
                path: 'vendor',
                select: 'firstName lastName shopName address phoneNumber email vendorImage logo banner status',
            },
            {
                path: 'products',
                select: 'name description category subCategory subSubCategory brand productType digitalProductType sku unit tags price discount discountType discountAmount taxAmount taxIncluded minimumOrderQty quantity stock isFeatured color attributeType size thumbnail images videoLink status',
            },
        ],
    })
}

// Create a new refund request
export const createRefund = createOne(Refund)

export const getAllRefunds = getAll(Refund)
// export const getAllRefunds = async (req, res) => {
//     try {
//         const { status, searchQuery } = req.query

//         const query = {}
//         if (status) query.status = status
//         if (searchQuery)
//             query['order.customer.firstName'] = {
//                 $regex: searchQuery,
//                 $options: 'i',
//             }

//         console.log(query)

//         const refunds = await populateOrderDetails(Refund.find(query))
//             .sort({ status: 1 })
//             .exec()

//         sendSuccessResponse(res, refunds, 'Refunds fetched successfully')
//     } catch (error) {
//         console.error(`[ERROR] Error fetching refunds: ${error.message}`)
//         sendErrorResponse(res, error)
//     }
// }

// Get refund by ID
export const getRefundById = getOne(Refund)

// Update a refund status
export const updateRefundStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { status, statusReason } = req.body

    const doc = await Refund.findByIdAndUpdate(
        id,
        { status, statusReason, processedAt: Date.now() },
        { new: true, runValidators: true }
    )

    // Handle case where the document was not found
    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }

    // Update cache
    const cacheKey = getCacheKey(Refund, '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc,
    })
})

// Delete a refund
export const deleteRefund = deleteOne(Refund)

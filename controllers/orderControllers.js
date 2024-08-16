import Order from '../models/orderModel.js'
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../utils/responseHandler.js'
import { buildSearchQuery } from '../utils/buildSearchQuery.js'
import { getCache, setCache, deleteCache } from '../utils/redisUtils.js'
import { createOne, deleteOne, getAll, getOne } from './handleFactory.js'

const populateOrderDetails = (query) => {
    return query
        .populate({
            path: 'products',
            select: 'name description price sku category subCategory subSubCategory brand productType digitalProductType unit tags discount discountType discountAmount taxAmount taxIncluded minimumOrderQty quantity stock isFeatured color attributeType size thumbnail images videoLink status',
            populate: [
                { path: 'category', select: 'name' },
                { path: 'subCategory', select: 'name' },
                { path: 'brand', select: 'name' },
            ],
        })
        .populate({
            path: 'customer',
            select: 'firstName lastName email phoneNumber image role referCode status permanentAddress officeShippingAddress officeBillingAddress',
        })
        .populate({
            path: 'vendor',
            select: 'firstName lastName phoneNumber email shopName address vendorImage logo banner status',
        })
}

// Create a new order
export const createOrder = createOne(Order)

export const getAllOrders = getAll(Order)

// Delete an order
export const deleteOrder = deleteOne(Order)

// Get order by ID
export const getOrderById = getOne(Order)

// Update an order's status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { orderStatus } = req.body
        const order = await Order.findByIdAndUpdate(
            id,
            { orderStatus },
            { new: true, runValidators: true }
        )
        if (!order) {
            return sendErrorResponse(res, 'Order not found', 404)
        }

        const cacheKey = `order:${id}`
        const populatedOrder = await populateOrderDetails(
            Order.findById(order._id)
        )
        await setCache(cacheKey, populatedOrder, 600)
        await deleteCache('all_orders')

        sendSuccessResponse(
            res,
            populatedOrder,
            'Order Status Updated successfully'
        )
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

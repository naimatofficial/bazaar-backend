import Order from '../models/orderModel.js'
import { createOne, deleteOne, getAll, getOne } from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'

// Create a new order
export const createOrder = createOne(Order)

export const getAllOrders = getAll(Order)

// Delete an order
export const deleteOrder = deleteOne(Order)

// Get order by ID
export const getOrderById = getOne(Order)

// Update an order's status
export const updateOrderStatus = catchAsync(async (req, res) => {
    const { id } = req.params
    const { orderStatus } = req.body
    const order = await Order.findByIdAndUpdate(
        id,
        { orderStatus },
        { new: true, runValidators: true }
    )

    if (!order) {
        return next(new AppError('No order found with that ID', 404))
    }

    // Update cache
    const cacheKey = getCacheKey(Order, '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc: order,
    })
})

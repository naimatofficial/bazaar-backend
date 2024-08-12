
import Order from '../models/orderModel.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responseHandler.js';
import { buildSearchQuery } from '../utils/buildSearchQuery.js';
import { client } from '../utils/redisClient.js';
import { getCache, setCache, deleteCache } from '../utils/redisUtils.js';

const populateOrderDetails = (query) => {
    return query
        .populate({
            path: 'products',
            select: 'name description price sku category subCategory subSubCategory brand productType digitalProductType unit tags discount discountType discountAmount taxAmount taxIncluded minimumOrderQty quantity stock isFeatured color attributeType size thumbnail images videoLink status',
            populate: [
                { path: 'category', select: 'name' },
                { path: 'subCategory', select: 'name' },
                { path: 'brand', select: 'name' },
            ]
        })
        .populate({
            path: 'customer',
            select: 'firstName lastName email phoneNumber image role referCode status permanentAddress officeShippingAddress officeBillingAddress'
        })
        .populate({
            path: 'vendor',
            select: 'firstName lastName phoneNumber email shopName address vendorImage logo banner status'
        });
};

// Create a new order
export const createOrder = async (req, res) => {
    try {
        const order = await Order.create(req.body);
        const cacheKey = `order:${order._id}`;
        
        const populatedOrder = await populateOrderDetails(Order.findById(order._id));
        await setCache(cacheKey, populatedOrder, 600); // Set with expiration
        
        await deleteCache('all_orders'); // Invalidate all orders cache
     
        sendSuccessResponse(res, populatedOrder, 'Order created successfully');
    } catch (error) {
        sendErrorResponse(res, error);
    }
};




export const getAllOrders = async (req, res) => {
    try {
        const searchParams = req.query;
        const queryObject = buildSearchQuery(searchParams);
        let cacheKey = `orders_list_${JSON.stringify(queryObject)}`;

        // Check if cached data exists
        let cacheData = await getCache(cacheKey);
        if (cacheData) {
            return res.status(200).json({
                success: true,
                message: 'Orders fetched successfully from cache',
                docs: cacheData
            });
        }

        const orders = await Order.find(queryObject).exec();

        // Cache the data if valid
        await setCache(cacheKey, orders, 600); // Set with expiration of 600 seconds (10 minutes)

        // Send success response
        res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            docs: orders
        });
    } catch (error) {
        sendErrorResponse(res, error);
    }
};

// Update an order's status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;
        const order = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true, runValidators: true });
        if (!order) {
            return sendErrorResponse(res, 'Order not found', 404);
        }

        const cacheKey = `order:${id}`;
        const populatedOrder = await populateOrderDetails(Order.findById(order._id));
        await setCache(cacheKey, populatedOrder, 600);
        await deleteCache('all_orders'); 

        sendSuccessResponse(res, populatedOrder, 'Order Status Updated successfully');
    } catch (error) {
        sendErrorResponse(res, error);
    }
};

// Delete an order
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return sendErrorResponse(res, 'Order not found', 404);
        }

        const cacheKey = `order:${id}`;
        await deleteCache(cacheKey); // Remove order cache
        await deleteCache('all_orders'); // Invalidate all orders cache

        sendSuccessResponse(res, 'Order Deleted successfully');
    } catch (error) {
        sendErrorResponse(res, error);
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `order:${id}`;

        let order = await getCache(cacheKey);
        if (order) {
        } else {
            order = await populateOrderDetails(Order.findById(id)).exec();
            if (!order) {
                return sendErrorResponse(res, 'Order not found', 404);
            }
            await setCache(cacheKey, order, 600); // Set with expiration
        }

        sendSuccessResponse(res, order, 'Order fetched successfully');
z    } catch (error) {
        sendErrorResponse(res, error);
    }
};

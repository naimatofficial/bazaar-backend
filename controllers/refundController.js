
import Refund from '../models/refundModel.js';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

const populateOrderDetails = (query) => {
    return query.populate({
        path: 'order',
        populate: [
            { path: 'customer', select: 'firstName lastName email phoneNumber role referCode status' },
            { path: 'vendor', select: 'firstName lastName shopName address phoneNumber email vendorImage logo banner status' },
            { path: 'products', select: 'name description category subCategory subSubCategory brand productType digitalProductType sku unit tags price discount discountType discountAmount taxAmount taxIncluded minimumOrderQty quantity stock isFeatured color attributeType size thumbnail images videoLink status' },
        ],
    });
};

// Create a new refund request
export const createRefund = async (req, res) => {
    try {
        const { order, reason } = req.body;

        const orderExists = await Order.findById(order);
        if (!orderExists) {
            return sendErrorResponse(res, 'Order not found', 404);
        }

        const refund = await Refund.create({ order, reason });

        sendSuccessResponse(res, refund, 'Refund request created successfully', 201);
    } catch (error) {
        console.error(`[ERROR] Error creating refund request: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

export const getAllRefunds = async (req, res) => {
    try {
        const { status, searchQuery } = req.query;

        const query = {};
        if (status) query.status = status;
        if (searchQuery) query['order.customer.firstName'] = { $regex: searchQuery, $options: 'i' };

        const refunds = await populateOrderDetails(Refund.find(query)).sort({ status: 1 }).exec();

        sendSuccessResponse(res, refunds, 'Refunds fetched successfully');
    } catch (error) {
        console.error(`[ERROR] Error fetching refunds: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

// Get refund by ID
export const getRefundById = async (req, res) => {
    try {
        const { id } = req.params;

        const refund = await populateOrderDetails(Refund.findById(id)).exec();
        if (!refund) {
            return sendErrorResponse(res, 'Refund not found', 404);
        }

        sendSuccessResponse(res, refund, 'Refund fetched successfully');
    } catch (error) {
        console.error(`[ERROR] Error fetching refund: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

// Update a refund status
export const updateRefundStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, statusReason } = req.body;

        const refund = await Refund.findByIdAndUpdate(
            id,
            { status, statusReason, processedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!refund) {
            return sendErrorResponse(res, 'Refund not found', 404);
        }

        sendSuccessResponse(res, refund, 'Refund status updated successfully');
    } catch (error) {
        console.error(`[ERROR] Error updating refund status: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

// Delete a refund request
export const deleteRefund = async (req, res) => {
    try {
        const { id } = req.params;
        const refund = await Refund.findByIdAndDelete(id);
        if (!refund) {
            return sendErrorResponse(res, 'Refund not found', 404);
        }

        sendSuccessResponse(res, null, 'Refund deleted successfully', 204);
    } catch (error) {
        console.error(`[ERROR] Error deleting refund: ${error.message}`);
        sendErrorResponse(res, error);
    }
};

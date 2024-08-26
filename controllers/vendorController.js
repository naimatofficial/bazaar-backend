import Vendor from '../models/vendorModel.js'
import { client } from '../utils/redisClient.js'
import {
    sendSuccessResponse,
    sendErrorResponse,
} from '../utils/responseHandler.js'

import jwt from 'jsonwebtoken'
import { deleteOne, getAll, getOne } from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'

// Create a new vendor
export const createVendor = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            phoneNumber,
            email,
            password,
            shopName,
            address,
        } = req.body

        const vendorImage = req.files['vendorImage']
            ? req.files['vendorImage'][0].path
            : null
        const logo = req.files['logo'] ? req.files['logo'][0].path : null
        const banner = req.files['banner'] ? req.files['banner'][0].path : null

        const vendor = new Vendor({
            firstName,
            lastName,
            phoneNumber,
            email,
            password,
            shopName,
            address,
            vendorImage,
            logo,
            banner,
            status: 'pending', // Set default status to pending
        })

        const savedVendor = await vendor.save()
        if (savedVendor) {
            const cacheKey = `vendor:${savedVendor._id}`
            await client.set(cacheKey, JSON.stringify(savedVendor))
            await client.del('all_vendors')

            sendSuccessResponse(res, savedVendor, 'Vendor added successfully')
        } else {
            throw new Error('Vendor could not be created')
        }
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Vendor registration (similar to createVendor but may have different logic)
export const registerVendor = catchAsync(async (req, res) => {
    const {
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        shopName,
        address,
    } = req.body

    const vendorImage = req.files['vendorImage']
        ? req.files['vendorImage'][0].path
        : null
    const logo = req.files['logo'] ? req.files['logo'][0].path : null
    const banner = req.files['banner'] ? req.files['banner'][0].path : null

    const newVendor = new Vendor({
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        shopName,
        address,
        vendorImage,
        logo,
        banner,
        status: 'pending',
    })

    const savedVendor = await newVendor.save()
    if (savedVendor) {
        const cacheKey = `vendor:${savedVendor._id}`
        await client.set(cacheKey, JSON.stringify(savedVendor))
        await client.del('all_vendors')

        sendSuccessResponse(res, savedVendor, 'Vendor registered successfully')
    } else {
        throw new Error('Vendor could not be registered')
    }
})

// Update vendor status
export const updateVendorStatus = catchAsync(async (req, res, next) => {
    const { vendorId } = req.params
    const { status } = req.body

    const updatedVendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { status },
        { new: true }
    )

    if (!updatedVendor) {
        return next(new AppError('No vendor found with that ID', 404))
    }

    // Update cache
    const cacheKey = getCacheKey(Vendor, '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc: updatedVendor,
    })
})
// Get all vendors
export const getAllVendors = getAll(Vendor)

// Get vendor by ID
export const getVendorById = getOne(Vendor)
// Delete vendor by ID
export const deleteVendor = deleteOne(Vendor)

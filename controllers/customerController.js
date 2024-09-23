import redisClient from '../config/redisConfig.js'
import Customer from '../models/customerModel.js'
import AppError from '../utils/appError.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './handleFactory.js'

export const createCustomer = createOne(Customer)
export const getCustomers = getAll(Customer)
export const getCustomer = getOne(Customer)
export const deleteCustomer = deleteOne(Customer)

export const updateCustomer = catchAsync(async (req, res) => {
    const newImage = req.file ? req.file.filename : req.body.logo

    console.log(req.user)

    const customer = await Customer.findById(req.user._id)

    if (!customer) {
        return next(new AppError(`No customer found with that Id.`, 404))
    }

    const data = {
        image: newImage || customer.image,
        phoneNumber: req.body?.phoneNumber || customer.phoneNumber,
        email: req.body?.email || customer.email,
        firstName: req.body?.firstName || customer.firstName,
        lastName: req.body?.lastName || customer.lastName,
    }

    console.log(data)

    const updatedCustomer = await Customer.findByIdAndUpdate(
        req.user._id,
        data,
        {
            new: true,
            runValidators: true,
        }
    )

    if (!updatedCustomer) {
        return next(new AppError(`Customer is not updated.`, 404))
    }

    const cacheKeyOne = getCacheKey('Customer', req.params.id)

    // delete pervious document data
    await redisClient.del(cacheKeyOne)

    // updated the cache with new data
    await redisClient.setEx(cacheKeyOne, 3600, JSON.stringify(updatedCustomer))

    // Update cache
    const cacheKey = getCacheKey('Customer', '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc: updatedCustomer,
    })
})

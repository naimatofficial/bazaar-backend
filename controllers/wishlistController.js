import Wishlist from '../models/wishlistModel.js'
import Product from '../models/productModel.js'
import Customer from '../models/customerModel.js'
import { deleteOne, getAll, getOne } from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'

export const getAllWishlists = getAll(Wishlist)

export const deleteWishlist = deleteOne(Wishlist)

export const getWishlist = getOne(Wishlist)

export const addProductToWishlist = catchAsync(async (req, res) => {
    const { userId, productId } = req.body

    // Step 1: Check the product in Product document
    const product = await Product.findById(productId)

    if (!product) {
        return next(new AppError('No product found with that ID', 404))
    }

    // Step 2: Check the customer in Customer document
    const customer = await Customer.findById(userId)

    if (!customer) {
        return next(new AppError('No customer found with that ID', 404))
    }

    // Step 3: Check the user is exisit in wishlist
    const doc = await Wishlist.findOne({ user: userId })

    if (!doc) {
        doc = new Wishlist({
            user: userId,
            products: [productId],
        })
    } else {
        const productEixist = doc.products.findIndex(
            (product) => product._id === productId
        )

        if (!productEixist) {
            doc.products[productEixist] = {
                user: userId,
                products: [productId],
            }
        } else {
            doc.products.push(productId)
        }
    }

    // Save the wishlist document
    await doc.save()

    // Invalidate the cache for this document
    const cacheKey = getCacheKey(Wishlist, '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc,
    })
})

export const removeProductFromWishlist = catchAsync(async (req, res, next) => {
    const { productId } = req.params

    // Step 1: Find the wishlist document for the user
    const doc = await Wishlist.findOne({ user: req.user._id })

    // Step 2: Handle case where the wishlist is not found
    if (!doc) {
        return next(new AppError('No wishlist found for this user', 404))
    }

    console.log(doc.products.length)

    // Step 3: Find the product in the wishlist
    const productIndex = doc.products.findIndex(
        (product) => product._id.toString() === productId
    )

    // Step 4: Handle case where the product is not found
    if (productIndex === -1) {
        return next(new AppError('Product not found in wishlist', 404))
    }

    // Step 5: Remove the product from the array
    doc.products.splice(productIndex, 1)

    console.log(doc.products.length)

    // Step 6: Save the updated document
    await doc.save()

    // Invalidate the cache for this document
    const cacheKey = getCacheKey(Wishlist, '', req.query)
    await redisClient.del(cacheKey)

    res.status(204).json({
        status: 'success',
        message: 'Wishlist product deleted.',
    })
})

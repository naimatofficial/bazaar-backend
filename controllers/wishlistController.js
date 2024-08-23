import Wishlist from '../models/wishlistModel.js'
import Product from '../models/productModel.js'
import Customer from '../models/customerModel.js'
import { deleteOne, getAll, getOne } from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'
import mongoose from 'mongoose'

export const getAllWishlists = getAll(Wishlist)

export const deleteWishlist = deleteOne(Wishlist)

export const getWishlist = getOne(Wishlist)

export const addProductToWishlist = async (req, res) => {
    const { userId, productId } = req.body

    // const userId = req.user._id

    try {
        let product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }
        let customer = await Customer.findById(userId)
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }
        let wishlist = await Wishlist.findOne({ user: userId })

        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, products: [productId] })
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId)
            }
        }

        await wishlist.save()
        res.status(200).json(wishlist)
    } catch (error) {
        res.status(500).json({
            message: 'Error adding product to wishlist',
            error,
        })
    }
}

// export const addProductToWishlist = catchAsync(async (req, res) => {
//     const { productId } = req.body
//     const userId = req.user._id

//     // Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//         return next(new AppError('Invalid product ID', 400))
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         return next(new AppError('Invalid user ID', 400))
//     }

//     // Check if the user exists
//     const userExists = await Customer.findById(userId)

//     console.log(userExists)
//     if (!userExists) {
//         return next(new AppError('No user found with that ID', 404))
//     }

//     // Check if the product exists
//     const productExists = await Product.findById(productId)
//     if (!productExists) {
//         return next(new AppError('No product found with that ID', 404))
//     }

//     // Find the wishlist for the user, or create a new one if it doesn't exist
//     let wishlist = await Wishlist.findOne({ user: userId })

//     console.log(wishlist)

//     if (!wishlist) {
//         wishlist = new Wishlist({ user: userId, products: [productId] })
//     } else {
//         if (!wishlist.products.includes(productId)) {
//             wishlist.products.push(productId)
//         }
//     }

//     await wishlist.save()

//     res.status(200).json({
//         status: 'success',
//         doc: wishlist,
//     })
// })

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

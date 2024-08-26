import ProductReview from './../models/productReviewModel.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './handleFactory.js'

export const createProductReview = createOne(ProductReview)

export const getAllProductReviews = getAll(ProductReview)

// Delete an ProductReview
export const deleteProductReview = deleteOne(ProductReview)

export const updateProductReview = updateOne(ProductReview)

// Get ProductReview by ID
export const getProductReviewById = getOne(ProductReview)

import Category from '../models/categoryModel.js'
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../utils/responseHandler.js'
import fs from 'fs'
import path from 'path'
import slugify from 'slugify'
import { client } from '../utils/redisClient.js'
import { deleteOne, getAll, getOne } from './handleFactory.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import redisClient from '../config/redisConfig.js'

// Create a new category
export const createCategory = catchAsync(async (req, res) => {
    const { name, priority } = req.body
    console.log(req.file)
    const logo = req.file ? req.file.filename : null
    const slug = slugify(name, { lower: true })

    const category = new Category({ name, logo, priority, slug })
    await category.save()

    if (!category) {
        return res.status(400).json({
            status: 'fail',
            message: `Category could not be created`,
        })
    }

    const cacheKeyOne = getCacheKey('Category', category?._id)
    await redisClient.setEx(cacheKeyOne, 3600, JSON.stringify(category))

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('Category', '', req.query)
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc: category,
    })
})
// Get all categories with optional search functionality
// export const getCategories = async (req, res) => {
//     try {
//         const { search } = req.query;

//         const cacheKey = search ? `categories_search_${search}` : 'categories';

//         const cachedCategories = await client.get(cacheKey);
//         if (cachedCategories) {
//             console.log('Serving categories from cache');
//             return sendSuccessResponse(res, JSON.parse(cachedCategories), "Categories fetched successfully");
//         }
//         const query = search ? { name: { $regex: search, $options: 'i' } } : {};

//         const categories = await Category.find(query);

//         await client.set(cacheKey, JSON.stringify(categories));

//         sendSuccessResponse(res, categories, "Categories fetched successfully");
//     } catch (error) {
//         sendErrorResponse(res, error.message);
//     }
// };

export const getCategories = getAll(Category, { path: 'productCount' })

// Get a single category by ID
export const getCategoryById = getOne(Category)

// Update a category by ID
export const updateCategory = catchAsync(async (req, res) => {
    const { name, priority } = req.body
    const logo = req.file ? req.file.filename : req.body.logo
    const slug = slugify(name, { lower: true })

    const category = await Category.findByIdAndUpdate(
        req.params.id,
        { name, logo, priority, slug },
        {
            new: true,
            runValidators: true,
        }
    )

    if (!category) {
        return sendErrorResponse(res, 'Category not found', 404)
    }

    await client.del(`category_${req.params.id}`)
    await client.del('categories')
})
// Delete a category by ID
export const deleteCategory = deleteOne(Category)
// Get category by slug
export const getCategoryBySlug = async (req, res) => {
    try {
        const slug = req.params.slug

        // Check if the category by slug is cached
        const cachedCategory = await client.get(`category_slug_${slug}`)
        if (cachedCategory) {
            console.log('Serving category by slug from cache')
            return sendSuccessResponse(
                res,
                JSON.parse(cachedCategory),
                'Category fetched successfully'
            )
        }

        const category = await Category.findOne({ slug })
        if (!category) {
            return sendErrorResponse(res, 'Category not found', 404)
        }

        // Cache the category by slug
        await client.set(`category_slug_${slug}`, JSON.stringify(category))

        sendSuccessResponse(res, category, 'Category fetched successfully')
    } catch (error) {
        sendErrorResponse(res, error.message)
    }
}

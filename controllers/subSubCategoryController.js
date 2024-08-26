import SubSubCategory from '../models/subSubCategoryModel.js'
import SubCategory from '../models/subCategoryModel.js'
import Category from '../models/categoryModel.js'
import slugify from 'slugify'
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../utils/responseHandler.js'
import { client } from '../utils/redisClient.js'
import { deleteOne, getAll, getOne, updateOne } from './handleFactory.js'

// Create a new sub-subcategory
export const createSubSubCategory = async (req, res) => {
    try {
        const {
            name,
            mainCategory: mainCategorySlug,
            subCategory,
            priority,
        } = req.body

        const mainCategory = await Category.findOne({ slug: mainCategorySlug })
        if (!mainCategory) {
            return sendErrorResponse(res, 'Main category not found.', 400)
        }

        const newSubSubCategory = new SubSubCategory({
            name,
            mainCategory: mainCategory._id,
            subCategory,
            priority,
            slug: slugify(name, { lower: true }),
        })

        const savedSubSubCategory = await newSubSubCategory.save()

        await client.del('subsubcategories')
        await client.del(`subsubcategories_sub_${subCategory}`)

        sendSuccessResponse(
            res,
            savedSubSubCategory,
            'Sub-subcategory created successfully',
            201
        )
    } catch (error) {
        sendErrorResponse(res, error.message)
    }
}

export const getAllSubSubCategories = getAll(SubSubCategory)

// Get a sub-subcategory by ID
export const getSubSubCategoryById = getOne(SubSubCategory)

// Get a sub-subcategory by slug
export const getSubSubCategoryBySlug = async (req, res) => {
    try {
        const slug = req.params.slug

        const cacheKey = `subsubcategory_slug_${slug}`
        const cachedSubSubCategory = await client.get(cacheKey)
        if (cachedSubSubCategory) {
            return sendSuccessResponse(
                res,
                JSON.parse(cachedSubSubCategory),
                'Sub-subcategory fetched successfully'
            )
        }

        const subSubCategory = await SubSubCategory.findOne({ slug }).populate(
            'mainCategory subCategory',
            'name'
        )
        if (!subSubCategory) {
            return sendErrorResponse(res, 'Sub-subcategory not found.', 404)
        }

        await client.set(cacheKey, JSON.stringify(subSubCategory))

        sendSuccessResponse(
            res,
            subSubCategory,
            'Sub-subcategory fetched successfully'
        )
    } catch (error) {
        sendErrorResponse(res, error.message)
    }
}

// Update a sub-subcategory by ID
export const updateSubSubCategoryById = updateOne(SubSubCategory)
// Delete a sub-subcategory by ID
export const deleteSubSubCategoryById = deleteOne(SubSubCategory)
// Get sub-subcategories by subcategory slug
export const getSubSubCategoriesBySubCategorySlug = async (req, res) => {
    try {
        const { slug } = req.params

        const subCategory = await SubCategory.findOne({ slug })
        if (!subCategory) {
            return sendErrorResponse(res, 'Subcategory not found.', 404)
        }

        const cacheKey = `subsubcategories_sub_${subCategory._id}`
        const cachedSubSubCategories = await client.get(cacheKey)
        if (cachedSubSubCategories) {
            return sendSuccessResponse(
                res,
                JSON.parse(cachedSubSubCategories),
                'Sub-subcategories fetched successfully'
            )
        }

        const subSubCategories = await SubSubCategory.find({
            subCategory: subCategory._id,
        }).populate('mainCategory', 'name')

        await client.set(cacheKey, JSON.stringify(subSubCategories))

        sendSuccessResponse(
            res,
            subSubCategories,
            'Sub-subcategories fetched successfully'
        )
    } catch (error) {
        sendErrorResponse(res, error.message)
    }
}

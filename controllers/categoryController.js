import Category from "../models/categoryModel.js";
import {
	sendErrorResponse,
	sendSuccessResponse,
} from "../utils/responseHandler.js";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import { client } from "../utils/redisClient.js";
import { getAll } from "./handleFactory.js";

// Create a new category
export const createCategory = async (req, res) => {
	try {
		const { name, priority } = req.body;
		const logo = req.file ? req.file.filename : null;
		const slug = slugify(name, { lower: true });

		const category = new Category({ name, logo, priority, slug });
		await category.save();

		await client.del("categories");

		sendSuccessResponse(res, category, "Category created successfully", 201);
	} catch (error) {
		sendErrorResponse(res, error.message);
	}
};

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

export const getCategories = getAll(Category, { path: "productCount" });

// Get a single category by ID
export const getCategoryById = async (req, res) => {
	try {
		const categoryId = req.params.id;

		const cachedCategory = await client.get(`category_${categoryId}`);
		if (cachedCategory) {
			console.log("Serving category from cache");
			return sendSuccessResponse(
				res,
				JSON.parse(cachedCategory),
				"Category fetched successfully"
			);
		}

		const category = await Category.findById(categoryId);
		if (!category) {
			return sendErrorResponse(res, "Category not found", 404);
		}

		await client.set(`category_${categoryId}`, JSON.stringify(category));

		sendSuccessResponse(res, category, "Category fetched successfully");
	} catch (error) {
		sendErrorResponse(res, error.message);
	}
};

// Update a category by ID
export const updateCategory = async (req, res) => {
	try {
		const { name, priority } = req.body;
		const logo = req.file ? req.file.filename : req.body.logo;
		const slug = slugify(name, { lower: true });

		const category = await Category.findByIdAndUpdate(
			req.params.id,
			{ name, logo, priority, slug },
			{
				new: true,
				runValidators: true,
			}
		);

		if (!category) {
			return sendErrorResponse(res, "Category not found", 404);
		}

		await client.del(`category_${req.params.id}`);
		await client.del("categories");

		sendSuccessResponse(res, category, "Category updated successfully");
	} catch (error) {
		sendErrorResponse(res, error.message);
	}
};

// Delete a category by ID
export const deleteCategory = async (req, res) => {
	try {
		const category = await Category.findByIdAndDelete(req.params.id);
		if (!category) {
			return sendErrorResponse(res, "Category not found", 404);
		}

		if (category.logo) {
			fs.unlinkSync(path.join("uploads", category.logo));
		}

		await client.del(`category_${req.params.id}`);
		await client.del("categories");

		sendSuccessResponse(res, category, "Category deleted successfully");
	} catch (error) {
		sendErrorResponse(res, error.message);
	}
};

// Get category by slug
export const getCategoryBySlug = async (req, res) => {
	try {
		const slug = req.params.slug;

		// Check if the category by slug is cached
		const cachedCategory = await client.get(`category_slug_${slug}`);
		if (cachedCategory) {
			console.log("Serving category by slug from cache");
			return sendSuccessResponse(
				res,
				JSON.parse(cachedCategory),
				"Category fetched successfully"
			);
		}

		const category = await Category.findOne({ slug });
		if (!category) {
			return sendErrorResponse(res, "Category not found", 404);
		}

		// Cache the category by slug
		await client.set(`category_slug_${slug}`, JSON.stringify(category));

		sendSuccessResponse(res, category, "Category fetched successfully");
	} catch (error) {
		sendErrorResponse(res, error.message);
	}
};

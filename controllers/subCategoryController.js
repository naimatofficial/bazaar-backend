import SubCategory from "../models/subCategoryModel.js";
import Category from "../models/categoryModel.js";
import slugify from "slugify";
import {
	sendErrorResponse,
	sendSuccessResponse,
} from "../utils/responseHandler.js";
import { client } from "../utils/redisClient.js";
import { getAll } from "./handleFactory.js";

// Create a new subcategory
export const createSubCategory = async (req, res) => {
	try {
		const { name, mainCategory, priority } = req.body;

		const category = await Category.findById(mainCategory);
		if (!category) {
			return sendErrorResponse(res, "Main category not found.", 400);
		}
		const newSubCategory = new SubCategory({
			name,
			mainCategory,
			priority,
			slug: slugify(name, { lower: true }),
		});

		const savedSubCategory = await newSubCategory.save();

		await client.del("subcategories");
		await client.del(`subcategories_main_${mainCategory}`);

		sendSuccessResponse(
			res,
			savedSubCategory,
			"Subcategory created successfully",
			201
		);
	} catch (error) {
		sendErrorResponse(res, error.message);
	}
};

// Get all subcategories with counts per main category
// export const getAllSubCategories = async (req, res) => {
//   try {
//     const cacheKey = 'subcategories';

//     const cachedSubCategories = await client.get(cacheKey);
//     if (cachedSubCategories) {
//       return sendSuccessResponse(res, JSON.parse(cachedSubCategories), "Subcategories fetched successfully");
//     }

//     const subCategories = await SubCategory.find().populate("mainCategory", "name");
//     const subCategoriesCount = await SubCategory.countDocuments();

//     const counts = await SubCategory.aggregate([
//       { $group: { _id: "$mainCategory", count: { $sum: 1 } } },
//       { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "mainCategory" } },
//       { $unwind: "$mainCategory" },
//       { $project: { _id: 0, mainCategory: "$mainCategory.name", count: 1 } }
//     ]);

//     await client.set(cacheKey, JSON.stringify({ subCategories, total: subCategoriesCount, counts }));

//     sendSuccessResponse(res, { subCategories, total: subCategoriesCount, counts }, "Subcategories fetched successfully");
//   } catch (error) {
//     sendErrorResponse(res, error.message);
//   }
// };

export const getAllSubCategories = getAll(SubCategory);

// Get a subcategory by ID
export const getSubCategoryById = async (req, res) => {
	try {
		const subCategoryId = req.params.id;

		const cacheKey = `subcategory_${subCategoryId}`;
		const cachedSubCategory = await client.get(cacheKey);
		if (cachedSubCategory) {
			console.log("Serving subcategory from cache");
			return sendSuccessResponse(
				res,
				JSON.parse(cachedSubCategory),
				"Subcategory fetched successfully"
			);
		}

		const subCategory = await SubCategory.findById(subCategoryId).populate(
			"mainCategory",
			"name"
		);
		if (!subCategory) {
			return sendErrorResponse(res, "Subcategory not found.", 404);
		}

		await client.set(cacheKey, JSON.stringify(subCategory));

		sendSuccessResponse(res, subCategory, "Subcategory fetched successfully");
	} catch (error) {
		sendErrorResponse(res, error.message);
	}
};

// Get a subcategory by slug
export const getSubCategoryBySlug = async (req, res) => {
	try {
		const slug = req.params.slug;

		const cacheKey = `subcategory_slug_${slug}`;
		const cachedSubCategory = await client.get(cacheKey);
		if (cachedSubCategory) {
			console.log("Serving subcategory by slug from cache");
			return sendSuccessResponse(
				res,
				JSON.parse(cachedSubCategory),
				"Subcategory fetched successfully"
			);
		}

		const subCategory = await SubCategory.findOne({ slug }).populate(
			"mainCategory",
			"name"
		);
		if (!subCategory) {
			return sendErrorResponse(res, "Subcategory not found.", 404);
		}

		await client.set(cacheKey, JSON.stringify(subCategory));

		sendSuccessResponse(res, subCategory, "Subcategory fetched successfully");
	} catch (error) {
		sendErrorResponse(res, error.message);
	}
};

export const updateSubCategoryById = async (req, res) => {
	try {
		const { name, mainCategory, priority } = req.body;

		const category = await Category.findById(mainCategory);
		if (!category) {
			return sendErrorResponse(res, "Main category not found.", 400);
		}

		const updatedSubCategory = await SubCategory.findByIdAndUpdate(
			req.params.id,
			{
				name,
				mainCategory,
				priority,
				slug: slugify(name, { lower: true }),
			},
			{ new: true, runValidators: true }
		).populate("mainCategory", "name");

		if (!updatedSubCategory) {
			return sendErrorResponse(res, "Subcategory not found.", 404);
		}

		await client.del(`subcategory_${req.params.id}`);
		await client.del("subcategories");
		await client.del(`subcategories_main_${mainCategory}`);

		sendSuccessResponse(
			res,
			updatedSubCategory,
			"Subcategory updated successfully"
		);
	} catch (error) {
		sendErrorResponse(res, error.message);
	}
};

// Delete a subcategory by ID
export const deleteSubCategoryById = async (req, res) => {
	try {
		const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
		if (!subCategory) {
			return sendErrorResponse(res, "Subcategory not found.", 404);
		}

		await client.del(`subcategory_${req.params.id}`);
		await client.del("subcategories");
		await client.del(`subcategories_main_${subCategory.mainCategory}`);

		sendSuccessResponse(res, { message: "Subcategory deleted successfully." });
	} catch (error) {
		sendErrorResponse(res, error.message);
	}
};

// Get subcategories by main category slug
export const getSubCategoriesByMainCategorySlug = async (req, res) => {
	try {
		const mainCategorySlug = req.params.slug;

		const mainCategory = await Category.findOne({ slug: mainCategorySlug });

		if (!mainCategory) {
			return sendErrorResponse(res, "Main category not found.", 404);
		}

		const cacheKey = `subcategories_main_${mainCategory._id}`;
		const cachedSubCategories = await client.get(cacheKey);
		if (cachedSubCategories) {
			console.log("Serving subcategories by main category from cache");
			return sendSuccessResponse(
				res,
				JSON.parse(cachedSubCategories),
				"Subcategories fetched successfully"
			);
		}

		const subCategories = await SubCategory.find({
			mainCategory: mainCategory._id,
		});

		await client.set(cacheKey, JSON.stringify(subCategories));

		sendSuccessResponse(
			res,
			subCategories,
			"Subcategories fetched successfully"
		);
	} catch (error) {
		sendErrorResponse(res, error.message);
	}
};

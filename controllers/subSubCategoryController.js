import SubSubCategory from "../models/subSubCategoryModel.js";
import SubCategory from "../models/subCategoryModel.js";
import Category from "../models/categoryModel.js";
import slugify from "slugify";
import { sendErrorResponse, sendSuccessResponse } from "../utils/responseHandler.js";
import { client } from "../utils/redisClient.js"; 

// Create a new sub-subcategory
export const createSubSubCategory = async (req, res) => {
  try {
    const { name, mainCategory: mainCategorySlug, subCategory, priority } = req.body;

    const mainCategory = await Category.findOne({ slug: mainCategorySlug });
    if (!mainCategory) {
      return sendErrorResponse(res, "Main category not found.", 400);
    }

    const newSubSubCategory = new SubSubCategory({
      name,
      mainCategory: mainCategory._id, 
      subCategory, 
      priority,
      slug: slugify(name, { lower: true }),
    });

    const savedSubSubCategory = await newSubSubCategory.save();

    await client.del('subsubcategories');
    await client.del(`subsubcategories_sub_${subCategory}`);

    sendSuccessResponse(res, savedSubSubCategory, "Sub-subcategory created successfully", 201);
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

// Get all sub-subcategories
export const getAllSubSubCategories = async (req, res) => {
  try {
    const cacheKey = 'subsubcategories';

    const cachedSubSubCategories = await client.get(cacheKey);
    if (cachedSubSubCategories) {
      return sendSuccessResponse(res, JSON.parse(cachedSubSubCategories), "Sub-subcategories fetched successfully");
    }

    const subSubCategories = await SubSubCategory.find().populate("mainCategory subCategory", "name");
    const subSubCategoriesCount = await SubSubCategory.countDocuments();

    const counts = await SubSubCategory.aggregate([
      { $group: { _id: "$subCategory", count: { $sum: 1 } } },
      { $lookup: { from: "subcategories", localField: "_id", foreignField: "_id", as: "subCategory" } },
      { $unwind: "$subCategory" },
      { $project: { _id: 0, subCategory: "$subCategory.name", count: 1 } },
    ]);

    // Cache the results
    await client.set(cacheKey, JSON.stringify({ subSubCategories, total: subSubCategoriesCount, counts }));

    sendSuccessResponse(res, { subSubCategories, total: subSubCategoriesCount, counts }, "Sub-subcategories fetched successfully");
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

// Get a sub-subcategory by ID
export const getSubSubCategoryById = async (req, res) => {
  try {
    const subSubCategoryId = req.params.id;

    const cacheKey = `subsubcategory_${subSubCategoryId}`;
    const cachedSubSubCategory = await client.get(cacheKey);
    if (cachedSubSubCategory) {
      return sendSuccessResponse(res, JSON.parse(cachedSubSubCategory), "Sub-subcategory fetched successfully");
    }

    const subSubCategory = await SubSubCategory.findById(subSubCategoryId).populate("mainCategory subCategory", "name");
    if (!subSubCategory) {
      return sendErrorResponse(res, "Sub-subcategory not found.", 404);
    }

    await client.set(cacheKey, JSON.stringify(subSubCategory));

    sendSuccessResponse(res, subSubCategory, "Sub-subcategory fetched successfully");
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

// Get a sub-subcategory by slug
export const getSubSubCategoryBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;

    const cacheKey = `subsubcategory_slug_${slug}`;
    const cachedSubSubCategory = await client.get(cacheKey);
    if (cachedSubSubCategory) {
      return sendSuccessResponse(res, JSON.parse(cachedSubSubCategory), "Sub-subcategory fetched successfully");
    }

    const subSubCategory = await SubSubCategory.findOne({ slug }).populate("mainCategory subCategory", "name");
    if (!subSubCategory) {
      return sendErrorResponse(res, "Sub-subcategory not found.", 404);
    }

    await client.set(cacheKey, JSON.stringify(subSubCategory));

    sendSuccessResponse(res, subSubCategory, "Sub-subcategory fetched successfully");
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

// Update a sub-subcategory by ID
export const updateSubSubCategoryById = async (req, res) => {
  try {
    const { name, mainCategory, subCategory, priority } = req.body;

    const category = await Category.findById(mainCategory);
    if (!category) {
      return sendErrorResponse(res, "Main category not found.", 400);
    }

    const subCat = await SubCategory.findById(subCategory);
    if (!subCat) {
      return sendErrorResponse(res, "Subcategory not found.", 400);
    }

    const updatedSubSubCategory = await SubSubCategory.findByIdAndUpdate(
      req.params.id,
      {
        name,
        mainCategory,
        subCategory,
        priority,
        slug: slugify(name, { lower: true }),
      },
      { new: true, runValidators: true }
    ).populate("mainCategory subCategory", "name");

    if (!updatedSubSubCategory) {
      return sendErrorResponse(res, "Sub-subcategory not found.", 404);
    }

    // Clear the cache for the specific sub-subcategory and related subcategories
    await client.del(`subsubcategory_${req.params.id}`);
    await client.del('subsubcategories');
    await client.del(`subsubcategories_sub_${subCategory}`);

    sendSuccessResponse(res, updatedSubSubCategory, "Sub-subcategory updated successfully");
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

// Delete a sub-subcategory by ID
export const deleteSubSubCategoryById = async (req, res) => {
  try {
    const deletedSubSubCategory = await SubSubCategory.findByIdAndDelete(req.params.id);
    if (!deletedSubSubCategory) {
      return sendErrorResponse(res, "Sub-subcategory not found.", 404);
    }

    // Clear the cache for the specific sub-subcategory and related subcategories
    await client.del(`subsubcategory_${req.params.id}`);
    await client.del('subsubcategories');
    await client.del(`subsubcategories_sub_${deletedSubSubCategory.subCategory}`);

    sendSuccessResponse(res, { message: "Sub-subcategory deleted successfully." });
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};

// Get sub-subcategories by subcategory slug
export const getSubSubCategoriesBySubCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const subCategory = await SubCategory.findOne({ slug });
    if (!subCategory) {
      return sendErrorResponse(res, "Subcategory not found.", 404);
    }

    const cacheKey = `subsubcategories_sub_${subCategory._id}`;
    const cachedSubSubCategories = await client.get(cacheKey);
    if (cachedSubSubCategories) {
      return sendSuccessResponse(res, JSON.parse(cachedSubSubCategories), "Sub-subcategories fetched successfully");
    }

    const subSubCategories = await SubSubCategory.find({ subCategory: subCategory._id }).populate("mainCategory", "name");

    await client.set(cacheKey, JSON.stringify(subSubCategories));

    sendSuccessResponse(res, subSubCategories, "Sub-subcategories fetched successfully");
  } catch (error) {
    sendErrorResponse(res, error.message);
  }
};



import express from "express";
import {
  createSubCategory,
  getAllSubCategories,
  getSubCategoryById,
  getSubCategoryBySlug,
  updateSubCategoryById,
  deleteSubCategoryById,
  getSubCategoriesByMainCategorySlug
} from "../controllers/subCategoryController.js";

const router = express.Router();

router.route("/")
  .post(createSubCategory)
  .get(getAllSubCategories);

router.route("/:id")
  .get(getSubCategoryById)
  .put(updateSubCategoryById)
  .delete(deleteSubCategoryById);

router.route("/slug/:slug")
  .get(getSubCategoryBySlug);

  // New route for getting subcategories by main category slug
router.route("/main-category/:slug")
.get(getSubCategoriesByMainCategorySlug);

export default router;

import express from 'express'
const router = express.Router()
import {
    createSubSubCategory,
    getAllSubSubCategories,
    getSubSubCategoryById,
    getSubSubCategoryBySlug,
    updateSubSubCategoryById,
    deleteSubSubCategoryById,
    getSubSubCategoriesBySubCategorySlug,
} from '../controllers/subSubCategoryController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import subSubCategoryValidationSchema from '../validations/subSubCategoryValidator.js'
// import { protect, admin } from "../middleware/authMiddleware.js";

router
    .route('/')
    .post(validateSchema(subSubCategoryValidationSchema), createSubSubCategory)
    .get(getAllSubSubCategories)

router
    .route('/:id')
    .get(getSubSubCategoryById)
    .put(updateSubSubCategoryById)
    .delete(deleteSubSubCategoryById)

router.route('/slug/:slug').get(getSubSubCategoryBySlug)

// get sub sub cateogries by sub category slug
router.get('/subcategory/:slug', getSubSubCategoriesBySubCategorySlug)

export default router

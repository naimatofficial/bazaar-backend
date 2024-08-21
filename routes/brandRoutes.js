import express from 'express'
import {
    createBrand,
    getBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    updateBrandStatus,
} from '../controllers/brandController.js'
import { uploadThumbnail } from '../config/multer-config.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import brandValidationSchema from './../validations/brandValidator.js'

const router = express.Router()

router
    .route('/')
    .post(uploadThumbnail, validateSchema(brandValidationSchema), createBrand)
    .get(getBrands)

router
    .route('/:id')
    .get(getBrandById)
    .put(uploadThumbnail, updateBrand)
    .delete(deleteBrand)

router.route('/:id/status').put(updateBrandStatus)

export default router

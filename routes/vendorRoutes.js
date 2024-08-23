import express from 'express'
import multer from 'multer'

import {
    createVendor,
    registerVendor,
    updateVendorStatus,
    getAllVendors,
    getVendorById,
    deleteVendor,
} from '../controllers/vendorController.js' // Adjust the path based on your project structure
import { validateSchema } from '../middleware/validationMiddleware.js'
import vendorValidationSchema from './../validations/vendorValidator.js'
import { loginLimiter } from '../utils/helpers.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'
import { loginVendor } from './../controllers/authController.js'

const router = express.Router()

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

const upload = multer({ storage })

router
    .route('/')
    .post(
        upload.fields([
            { name: 'vendorImage' },
            { name: 'logo' },
            { name: 'banner' },
        ]),
        validateSchema(vendorValidationSchema),
        createVendor
    )
    .get(protect, getAllVendors)

router
    .route('/:vendorId')
    .get(getVendorById)
    .delete(protect, restrictTo('admin', 'vendor'), deleteVendor)

router.route('/:vendorId/status').put(protect, updateVendorStatus)

router
    .route('/signup')
    .post(
        upload.fields([
            { name: 'vendorImage' },
            { name: 'logo' },
            { name: 'banner' },
        ]),
        validateSchema(vendorValidationSchema),
        registerVendor
    )

router.post('/login', loginLimiter, loginVendor)

export default router

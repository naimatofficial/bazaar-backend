import express from 'express'
import multer from 'multer'

import {
    createVendor,
    registerVendor,
    loginVendor,
    updateVendorStatus,
    getAllVendors,
    getVendorById,
    deleteVendor,
} from '../controllers/vendorController.js' // Adjust the path based on your project structure
import { validateSchema } from '../middleware/validationMiddleware.js'
import vendorValidationSchema from './../validations/vendorValidator.js'

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

// Vendor routes
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
    .get(getAllVendors)

router.route('/:vendorId').get(getVendorById).delete(deleteVendor)

router.route('/:vendorId/status').put(updateVendorStatus)

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

router.route('/login').post(loginVendor)

export default router

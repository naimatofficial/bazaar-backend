import express from 'express'
import multer from 'multer'
import path from 'path'
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoryBySlug,
} from '../controllers/categoryController.js'
import { validateSchema } from './../middleware/validationMiddleware.js'
import categoryValidationSchema from './../validations/categoryValidator.js'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb)
    },
})

const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png/
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    )
    const mimetype = filetypes.test(file.mimetype)

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        cb('Error: Images Only!')
    }
}

const router = express.Router()

router
    .route('/')
    .post(
        upload.single('logo'),
        validateSchema(categoryValidationSchema),
        createCategory
    )
    .get(getCategories)

router
    .route('/:id')
    .get(getCategoryById)
    .put(upload.single('logo'), updateCategory)
    .delete(deleteCategory)

router.route('/slug/:slug').get(getCategoryBySlug)

export default router

import express from 'express'
import { protect } from './../middleware/authMiddleware.js'
import {
    addProductToWishlist,
    removeProductFromWishlist,
    getWishlist,
    getAllWishlists,
    deleteWishlist,
} from '../controllers/wishlistController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import wishlistValidationSchema from '../validations/wishlistValidator.js'

const router = express.Router()

router.get('/', getAllWishlists)
router.post(
    '/add',
    validateSchema(wishlistValidationSchema),
    addProductToWishlist
)
router.delete('/products/:productId', protect, removeProductFromWishlist)
router.route('/:id').get(getWishlist).delete(deleteWishlist)

export default router

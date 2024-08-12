// routes/wishlistRoutes.js

import express from 'express';
import 
{ addProductToWishlist, removeProductFromWishlist, getWishlist }
 from '../controllers/wishlistController.js';

const router = express.Router();

router.post('/add', addProductToWishlist);
router.post('/remove', removeProductFromWishlist);
router.get('/:userId', getWishlist);

export default router;

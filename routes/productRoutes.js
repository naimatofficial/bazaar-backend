
import express from 'express';
import multer from 'multer';
import {
    createProduct,
    updateProductImages,
    getAllProducts,
    getProductById,
    deleteProduct,
    addReview,
    getProductReviews,
    updateProductStatus,
    updateProductFeaturedStatus,
  
    getTopRatedProducts,
    sellProduct,
    getLimitedStockedProducts,

    updateProduct,
    updateReviewStatus,   
  
} from '../controllers/productController.js';

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = file.fieldname === 'thumbnail' ? 'uploads/thumbnails/' : 'uploads/images/';
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Product routes
router.post('/', upload.fields([{ name: 'thumbnail' }, { name: 'images', maxCount: 10 }]), createProduct);
router.get('/', getAllProducts);

// Static routes 

router.get('/top-rated', getTopRatedProducts);
router.get('/limited-product', getLimitedStockedProducts);
router.get('/:productId/sold', sellProduct);
router.get('/:productId/update-product-image', updateProductImages);
router.post('/:productId/reviews', addReview);
router.get('/:productId/reviews', getProductReviews);
router.patch('/:reviewId/status', updateReviewStatus);
router.put('/:id/status', updateProductStatus);
router.put('/:id/feature', updateProductFeaturedStatus);
router.put('/:id', updateProduct);
router.get('/:id', getProductById);
router.delete('/:id', deleteProduct);


// // router.get('/feature-product', getFeaturedProducts);
// // router.get('/latest-product', getLatestProducts);
// router.get('/top-rated', getTopRatedProducts);
// // router.get('/pending', getAllPendingProducts);
// // router.get('/approved', getAllApprovedProducts);
// router.get('/filtered', getFilteredProducts);
// // router.get('/newest', getNewestProducts);
// // Dynamic routes
// // router.get('/vendor/:vendorId/vendor-product', getProductsByVendor);
// // router.get('/vendor/:vendorId/pending', getPendingProductsByVendor);
// // router.get('/vendor/:vendorId/denied', getDeniedProductsByVendor);
// // router.get('/vendor/:vendorId/approved', getApprovedProductsByVendor);
// // router.get('/vendor/:vendorId/newest', getNewestProductByVendor);
// router.post('/:productId/reviews', addReview);
// router.get('/:productId/reviews', getProductReviews);

// router.put('/:id/status', updateProductStatus);
// router.put('/:id/feature', updateProductFeaturedStatus);
// router.put('/:id', updateProduct);
// router.get('/:id', getProductById);
// router.delete('/:id', deleteProduct);

// // Update review status







export default router;






















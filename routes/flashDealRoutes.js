import express from 'express';
import multer from 'multer';
import {
    createFlashDeal,
    getFlashDeals,
    updateFlashDeal,
    addProductToFlashDeal,
    updateFlashDealStatus,
    updatePublishStatus,
    deleteFlashDeal,
    getFlashDealById,
    removeProductFromFlashDeal,
  
 
} from '../controllers/flashDealController.js';

const router = express.Router();


// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// Middleware to log file uploads
router.use((req, res, next) => {
    if (req.file) {
        console.log('Uploaded file:', req.file);
    }
    next();
});


// Routes for flash deals
router.post('/', upload.single('image'), createFlashDeal);
router.get('/', getFlashDeals);

router.get('/:id', getFlashDealById);
router.put('/:id', upload.single('image'), updateFlashDeal);
router.put('/:id/add-product', addProductToFlashDeal);
router.delete('/:id/remove-product/:productId', removeProductFromFlashDeal);

router.put('/:id', upload.single('image'), updateFlashDeal);
router.put('/:id/add-product', addProductToFlashDeal);

router.patch('/:id/status', updateFlashDealStatus);
router.patch('/:id/update-publish', updatePublishStatus);
router.delete('/:id', deleteFlashDeal);

export default router;

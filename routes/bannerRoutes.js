// routes/bannerRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { createBanner, getBanners, updateBanner, deleteBanner,updatePublishStatus, getBannerById } 
from '../controllers/bannerController.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});


const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, 
    fileFilter
});

router.post('/', upload.single('bannerImage'), createBanner);
router.get('/', getBanners);
router.put('/:id', upload.single('bannerImage'), updateBanner);

router.get('/:id', getBannerById);
router.delete('/:id', deleteBanner);


router.patch('/:id/publish', updatePublishStatus);
export default router;

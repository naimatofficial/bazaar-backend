// import express from 'express';
// import {
//   createBrand,
//   getBrands,
//   getBrandById,
//   updateBrand,

//   deleteBrand,
//   updateBrandStatus,

// } from '../controllers/brandController.js';
// import { uploadThumbnail } from '../config/multer-config.js';
// const router = express.Router();

// router.post('/',uploadThumbnail,createBrand)

// router.route('/').get(getBrands);
// router.route('/:id').get(getBrandById).put(updateBrand).delete(deleteBrand);

// router.put('/:id/status', updateBrandStatus);

// export default router;


import express from 'express';
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  updateBrandStatus,
} from '../controllers/brandController.js';
import { uploadThumbnail } from '../config/multer-config.js';

const router = express.Router();

// Create a new brand with image upload
router.post('/', uploadThumbnail, createBrand);

// Get all brands
router.route('/').get(getBrands);

// Get a brand by ID, update a brand, and delete a brand by ID
router.route('/:id')
  .get(getBrandById)
  .put(uploadThumbnail, updateBrand)  // Handle image upload on update
  .delete(deleteBrand);

// Update the status of a brand by ID
router.put('/:id/status', updateBrandStatus);

export default router;

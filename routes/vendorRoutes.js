
import express from 'express';
import multer from 'multer';

import { createVendor,registerVendor,loginVendor, updateVendorStatus, getAllVendors, getVendorById,deleteVendor } from '../controllers/vendorController.js'; // Adjust the path based on your project structure

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// POST /vendors - Create a new vendor
router.post('/', upload.fields([{ name: 'vendorImage' }, { name: 'logo' }, { name: 'banner' }]), createVendor);

router.post('/signup',  upload.fields([{ name: 'vendorImage' }, { name: 'logo' }, { name: 'banner' }]),registerVendor);

// POST /vendors/login - Vendor login
router.post('/login', loginVendor);

// PUT /vendors/:vendorId/status - Update vendor status
router.put('/:vendorId/status', updateVendorStatus);

// GET /vendors - Get all vendors
router.get('/', getAllVendors);

// GET /vendors/:vendorId - Get vendor by ID
router.get('/:vendorId', getVendorById);

router.delete('/:vendorId', deleteVendor); // Route for deleting a vendor

export default router;

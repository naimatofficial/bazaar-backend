import express from 'express';
import {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    updateCouponStatus,
    deleteCoupon
} from '../controllers/couponController.js';
const router = express.Router();

router.post('/', createCoupon);
router.get('/', getAllCoupons);
router.get('/:id', getCouponById);
router.put('/:id', updateCoupon);
router.patch('/:id/status', updateCouponStatus);
router.delete('/:id', deleteCoupon);

export default router;

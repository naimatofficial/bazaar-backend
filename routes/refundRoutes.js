import express from 'express'
import {
    createRefund,
    getAllRefunds,
    getRefundById,
    updateRefundStatus,
    deleteRefund,
} from '../controllers/refundController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import refundValidationSchema from './../validations/refundValidator.js'

const router = express.Router()

router
    .route('/')
    .get(getAllRefunds)
    .post(validateSchema(refundValidationSchema), createRefund)

router.route('/:id').get(getRefundById).delete(deleteRefund)

router.put('/:id/status', updateRefundStatus)

export default router

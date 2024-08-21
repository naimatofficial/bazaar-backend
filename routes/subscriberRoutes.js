import express from 'express'
import {
    getSubscribers,
    addSubscriber,
    deleteSubscriber,
} from '../controllers/subscriberController.js'
import { validateSchema } from '../middleware/validationMiddleware.js'
import subscriberValidationSchema from './../validations/subscriberValidator.js'

const router = express.Router()

router
    .route('/')
    .get(getSubscribers)
    .post(validateSchema(subscriberValidationSchema), addSubscriber)

router.route('/:id').delete(deleteSubscriber)

export default router

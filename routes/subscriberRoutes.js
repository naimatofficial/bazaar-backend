import express from 'express';
import {
  getSubscribers,
  addSubscriber,
  deleteSubscriber,

} from '../controllers/subscriberController.js';

const router = express.Router();

router.get('/', getSubscribers);
router.post('/', addSubscriber);
router.delete('/:id', deleteSubscriber);

export default router;

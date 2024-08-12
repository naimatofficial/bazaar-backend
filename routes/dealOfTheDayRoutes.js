import express from 'express';
import {
    createDealOfTheDay,
    getAllDealsOfTheDay,
    getDealOfTheDayById,
    updateDealOfTheDay,
    deleteDealOfTheDay,
    updateDealOfTheDayStatus
} from '../controllers/dealOfTheDayController.js';

const router = express.Router();

router.post('/', createDealOfTheDay);
router.get('/', getAllDealsOfTheDay);
router.get('/:id', getDealOfTheDayById);
router.put('/:id', updateDealOfTheDay);
router.delete('/:id', deleteDealOfTheDay);
router.patch('/:id/status', updateDealOfTheDayStatus);

export default router;

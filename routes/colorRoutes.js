import express from 'express';
import {
    createColor,
    getColors,
    getColorById,
    updateColor,
    deleteColor
} from '../controllers/colorController.js';

const router = express.Router();


router.post('/', createColor);
router.get('/', getColors);
router.get('/:id', getColorById);
router.put('/:id', updateColor);

router.delete('/:id', deleteColor);

export default router;

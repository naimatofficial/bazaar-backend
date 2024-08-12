import express from 'express';
import {
    createAttribute,
    getAttributes,
    getAttributeById,
    updateAttribute,
    deleteAttribute,

    
} from '../controllers/attributeController.js';

const router = express.Router();

router.post('/', createAttribute);
router.get('/', getAttributes);
router.get('/:id', getAttributeById);
router.put('/:id', updateAttribute);
router.delete('/:id', deleteAttribute);

export default router;

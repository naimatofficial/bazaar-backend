import express from 'express';
import {
    createFeatureDeal,
    getFeatureDeals,
    updateFeatureDeal,
    addProductToFeatureDeal,
    updateFeatureDealStatus,
    deleteFeatureDeal,
    getFeatureDealById,
    deleteProductFromFeatureDeal
} from '../controllers/featuredDealController.js';

const router = express.Router();

router.post('/', createFeatureDeal); 
router.get('/', getFeatureDeals); 
router.get('/:id', getFeatureDealById); 
router.delete('/:id', deleteFeatureDeal); 
router.put('/:id', updateFeatureDeal); 
router.put('/:id/add-product', addProductToFeatureDeal); 
router.patch('/:id/status', updateFeatureDealStatus); 
router.delete('/:id/remove-product/:productId', deleteProductFromFeatureDeal);

export default router;

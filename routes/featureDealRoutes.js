import express from "express";
import {
	createFeatureDeal,
	getFeatureDeals,
	updateFeatureDeal,
	addProductToFeatureDeal,
	updateFeatureDealStatus,
	deleteFeatureDeal,
	getFeatureDealById,
	deleteProductFromFeatureDeal,
} from "../controllers/featuredDealController.js";

const router = express.Router();
router.route("/").post(createFeatureDeal).get(getFeatureDeals);

router
	.route("/:id")
	.get(getFeatureDealById)
	.delete(deleteFeatureDeal)
	.put(updateFeatureDeal);

router.route("/:id/add-product").put(addProductToFeatureDeal);

router.route("/:id/status").patch(updateFeatureDealStatus);

router
	.route("/:id/remove-product/:productId")
	.delete(deleteProductFromFeatureDeal);

export default router;

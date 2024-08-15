import express from "express";
import {
	addProductToWishlist,
	removeProductFromWishlist,
	getWishlist,
	getAllWishlists,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.get("/", getAllWishlists);
router.post("/add", addProductToWishlist);
router.post("/remove", removeProductFromWishlist);
router.get("/:userId", getWishlist);

export default router;

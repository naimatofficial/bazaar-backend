import express from "express";
import {
	createBrand,
	getBrands,
	getBrandById,
	updateBrand,
	deleteBrand,
	updateBrandStatus,
} from "../controllers/brandController.js";
import { uploadThumbnail } from "../config/multer-config.js";

const router = express.Router();

router.route("/").post(uploadThumbnail, createBrand).get(getBrands);

router
	.route("/:id")
	.get(getBrandById)
	.put(uploadThumbnail, updateBrand)
	.delete(deleteBrand);

router.route("/:id/status").put(updateBrandStatus);

export default router;

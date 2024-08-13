import express from "express";
import {
	createColor,
	getColors,
	getColorById,
	updateColor,
	deleteColor,
} from "../controllers/colorController.js";

const router = express.Router();

router.route("/").post(createColor).get(getColors);

router.route("/:id").get(getColorById).put(updateColor).delete(deleteColor);

export default router;

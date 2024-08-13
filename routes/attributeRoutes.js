import express from "express";
import {
	createAttribute,
	getAttributes,
	getAttributeById,
	updateAttribute,
	deleteAttribute,
} from "../controllers/attributeController.js";

const router = express.Router();

router.route("/").post(createAttribute).get(getAttributes);
router
	.route("/:id")
	.get(getAttributeById)
	.put(updateAttribute)
	.delete(deleteAttribute);

export default router;

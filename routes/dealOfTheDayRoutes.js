import express from "express";
import {
	createDealOfTheDay,
	getAllDealsOfTheDay,
	getDealOfTheDayById,
	updateDealOfTheDay,
	deleteDealOfTheDay,
} from "../controllers/dealOfTheDayController.js";

const router = express.Router();
router.route("/").post(createDealOfTheDay).get(getAllDealsOfTheDay);

router
	.route("/:id")
	.get(getDealOfTheDayById)
	.put(updateDealOfTheDay)
	.delete(deleteDealOfTheDay);

export default router;

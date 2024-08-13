import express from "express";
import {
	createDealOfTheDay,
	getAllDealsOfTheDay,
	getDealOfTheDayById,
	updateDealOfTheDay,
	deleteDealOfTheDay,
	updateDealOfTheDayStatus,
} from "../controllers/dealOfTheDayController.js";

const router = express.Router();
router.route("/").post(createDealOfTheDay).get(getAllDealsOfTheDay);

router
	.route("/:id")
	.get(getDealOfTheDayById)
	.put(updateDealOfTheDay)
	.delete(deleteDealOfTheDay);

router.route("/:id/status").patch(updateDealOfTheDayStatus);

export default router;

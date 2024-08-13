import express from "express";
import {
	getSubscribers,
	addSubscriber,
	deleteSubscriber,
} from "../controllers/subscriberController.js";

const router = express.Router();

router.route("/").get(getSubscribers).post(addSubscriber);

router.route("/:id").delete(deleteSubscriber);

export default router;

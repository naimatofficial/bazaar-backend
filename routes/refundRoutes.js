import express from "express";
import {
	createRefund,
	getAllRefunds,
	getRefundById,
	updateRefundStatus,
	deleteRefund,
} from "../controllers/refundController.js";

const router = express.Router();

router.route("/").get(getAllRefunds).post(createRefund);

router.route("/:id").get(getRefundById).delete(deleteRefund);

router.put("/:id/status", updateRefundStatus);

export default router;

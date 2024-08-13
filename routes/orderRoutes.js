// routes/orderRoutes.js
import express from "express";
import {
	createOrder,
	getAllOrders,
	getOrderById,
	updateOrderStatus,
	deleteOrder,
} from "../controllers/orderControllers.js";

const router = express.Router();

router.route("/").post(createOrder).get(getAllOrders);

router.route("/:id").get(getOrderById).delete(deleteOrder);

router.route("/:id/status").put(updateOrderStatus);

export default router;

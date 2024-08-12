import express from "express";
import {
	createCustomer,
	deleteCustomer,
	getCustomer,
	getCustomers,
	updateCustomer,
} from "./../controllers/customerController.js";
import {
	logout,
	loginCustomer,
	signupCustomer,
} from "../controllers/authController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginCustomer);
router.post("/register", signupCustomer);
router.post("/logout", protect, logout);

router
	.route("/")
	// .post(protect, restrictTo("admin"), createCustomer)
	// .get(protect, restrictTo("admin", "vendor"), getCustomers);
	.post(createCustomer)
	.get(getCustomers);

router
	.route("/:id")
	.get(protect, getCustomer)
	.put(protect, restrictTo("admin", "customer"), updateCustomer)
	.delete(protect, restrictTo("admin", "customer"), deleteCustomer);

export default router;

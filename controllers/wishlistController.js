import Wishlist from "../models/wishlistModel.js";
import Product from "../models/productModel.js";
import Customer from "../models/customerModel.js";
import { getAll } from "./handleFactory.js";
import catchAsync from "../utils/catchAsync.js";

export const getAllWishlists = getAll(Wishlist);

export const addProductToWishlist = catchAsync(async (req, res) => {
	const { userId, productId } = req.body;

	console.log(req.body);

	let product = await Product.findById(productId);
	console.log(product);
	if (!product) {
		return res.status(404).json({ message: "Product not found" });
	}
	let customer = await Customer.findById(userId);
	if (!customer) {
		return res.status(404).json({ message: "Customer not found" });
	}
	let wishlist = await Wishlist.findOne({ user: userId });

	if (!wishlist) {
		wishlist = new Wishlist({ user: userId, products: [productId] });
	} else {
		if (!wishlist.products.includes(productId)) {
			wishlist.products.push(productId);
		}
	}

	await wishlist.save();
	res.status(200).json(wishlist);
});

export const removeProductFromWishlist = async (req, res) => {
	const { userId, productId } = req.body;

	try {
		const wishlist = await Wishlist.findOne({ user: userId });

		if (wishlist) {
			wishlist.products = wishlist.products.filter(
				(id) => id.toString() !== productId
			);
			await wishlist.save();
			res.status(200).json(wishlist);
		} else {
			res.status(404).json({ message: "Wishlist not found" });
		}
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error removing product from wishlist", error });
	}
};

export const getWishlist = async (req, res) => {
	const { userId } = req.params;

	console.log(req.params);

	try {
		const wishlist = await Wishlist.findOne({ user: userId })
			.populate({
				path: "products",
				select: "name",
			})
			.populate({
				path: "user",
				select: "firstName lastName email",
			});

		if (wishlist) {
			res.status(200).json(wishlist);
		} else {
			res.status(404).json({ message: "Wishlist not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error retrieving wishlist", error });
	}
};

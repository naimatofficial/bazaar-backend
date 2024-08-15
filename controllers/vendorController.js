import Vendor from "../models/vendorModel.js";
import { client } from "../utils/redisClient.js";
import {
	sendSuccessResponse,
	sendErrorResponse,
} from "../utils/responseHandler.js";
import {
	validateVendorInput,
	applyVendorSearchFilters,
} from "../validations/vendorUtils.js";
import jwt from "jsonwebtoken";
import { getAll } from "./handleFactory.js";

// Create a new vendor
export const createVendor = async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			phoneNumber,
			email,
			password,
			shopName,
			address,
		} = req.body;
		const { isValid, errors } = validateVendorInput(req.body);

		if (!isValid) {
			return sendErrorResponse(res, new Error(errors.join(", ")), 400);
		}

		const vendorImage = req.files["vendorImage"]
			? req.files["vendorImage"][0].path
			: null;
		const logo = req.files["logo"] ? req.files["logo"][0].path : null;
		const banner = req.files["banner"] ? req.files["banner"][0].path : null;

		const vendor = new Vendor({
			firstName,
			lastName,
			phoneNumber,
			email,
			password,
			shopName,
			address,
			vendorImage,
			logo,
			banner,
			status: "pending", // Set default status to pending
		});

		const savedVendor = await vendor.save();
		if (savedVendor) {
			const cacheKey = `vendor:${savedVendor._id}`;
			await client.set(cacheKey, JSON.stringify(savedVendor));
			await client.del("all_vendors");

			sendSuccessResponse(res, savedVendor, "Vendor added successfully");
		} else {
			throw new Error("Vendor could not be created");
		}
	} catch (error) {
		sendErrorResponse(res, error);
	}
};

// Vendor registration (similar to createVendor but may have different logic)
export const registerVendor = async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			phoneNumber,
			email,
			password,
			shopName,
			address,
		} = req.body;
		const { isValid, errors } = validateVendorInput(req.body);

		if (!isValid) {
			return sendErrorResponse(res, new Error(errors.join(", ")), 400);
		}

		const vendorImage = req.files["vendorImage"]
			? req.files["vendorImage"][0].path
			: null;
		const logo = req.files["logo"] ? req.files["logo"][0].path : null;
		const banner = req.files["banner"] ? req.files["banner"][0].path : null;

		const newVendor = new Vendor({
			firstName,
			lastName,
			phoneNumber,
			email,
			password,
			shopName,
			address,
			vendorImage,
			logo,
			banner,
			status: "pending",
		});

		const savedVendor = await newVendor.save();
		if (savedVendor) {
			const cacheKey = `vendor:${savedVendor._id}`;
			await client.set(cacheKey, JSON.stringify(savedVendor));
			await client.del("all_vendors");

			sendSuccessResponse(res, savedVendor, "Vendor registered successfully");
		} else {
			throw new Error("Vendor could not be registered");
		}
	} catch (error) {
		sendErrorResponse(res, error);
	}
};

// Vendor login
export const loginVendor = async (req, res) => {
	const { email, password } = req.body;

	try {
		const vendor = await Vendor.findOne({ email });

		if (!vendor) {
			return sendErrorResponse(res, new Error("Vendor not found"), 404);
		}

		const isPasswordCorrect = password === vendor.password;
		if (!isPasswordCorrect) {
			return sendErrorResponse(res, new Error("Invalid credentials"), 400);
		}

		const token = jwt.sign(
			{ email: vendor.email, id: vendor._id },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_ACCESS_TIME }
		);

		sendSuccessResponse(res, { result: vendor, token }, "Login successful");
	} catch (error) {
		sendErrorResponse(res, error);
	}
};

// Update vendor status
export const updateVendorStatus = async (req, res) => {
	try {
		const { vendorId } = req.params;
		const { status } = req.body;

		const updatedVendor = await Vendor.findByIdAndUpdate(
			vendorId,
			{ status },
			{ new: true }
		);

		if (!updatedVendor) {
			return sendErrorResponse(res, new Error("Vendor not found"), 404);
		}

		const cacheKey = `vendor:${updatedVendor._id}`;
		await client.set(cacheKey, JSON.stringify(updatedVendor));
		await client.del("all_vendors");

		sendSuccessResponse(
			res,
			updatedVendor,
			"Vendor status updated successfully"
		);
	} catch (error) {
		sendErrorResponse(res, error);
	}
};

// Get all vendors
export const getAllVendors = getAll(Vendor);

// Get vendor by ID
export const getVendorById = async (req, res) => {
	try {
		const { vendorId } = req.params;
		const cacheKey = `vendor:${vendorId}`;

		let vendor = await client.get(cacheKey);
		if (vendor) {
			vendor = JSON.parse(vendor);
		} else {
			vendor = await Vendor.findById(vendorId);
			if (vendor) {
				await client.set(cacheKey, JSON.stringify(vendor));
			} else {
				return sendErrorResponse(res, new Error("Vendor not found"), 404);
			}
		}

		sendSuccessResponse(res, vendor, "Vendor fetched successfully");
	} catch (error) {
		sendErrorResponse(res, error);
	}
};

// Delete vendor by ID
export const deleteVendor = async (req, res) => {
	try {
		const { vendorId } = req.params;

		const deletedVendor = await Vendor.findByIdAndDelete(vendorId);

		if (!deletedVendor) {
			return sendErrorResponse(res, new Error("Vendor not found"), 404);
		}

		const cacheKey = `vendor:${vendorId}`;
		await client.del(cacheKey);
		await client.del("all_vendors");

		sendSuccessResponse(
			res,
			{ message: "Vendor deleted successfully" },
			"Vendor deleted successfully"
		);
	} catch (error) {
		sendErrorResponse(res, error);
	}
};

// import Vendor from '../models/vendorModel.js';
// import { client } from '../utils/redisClient.js';
// import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
// import { validateVendorInput, applyVendorSearchFilters } from '../validations/vendorUtils.js';
// import jwt from 'jsonwebtoken';

// // Create a new vendor
// export const createVendor = async (req, res) => {
//   try {
//     const { firstName, lastName, phoneNumber, email, password, shopName, address } = req.body;
//     const { isValid, errors } = validateVendorInput(req.body);

//     if (!isValid) {
//       return sendErrorResponse(res, new Error(errors.join(', ')), 400);
//     }

//     const vendorImage = req.files?.vendorImage?.[0]?.path || null;
//     const logo = req.files?.logo?.[0]?.path || null;
//     const banner = req.files?.banner?.[0]?.path || null;

//     const vendor = new Vendor({
//       firstName,
//       lastName,
//       phoneNumber,
//       email,
//       password,
//       shopName,
//       address,
//       vendorImage,
//       logo,
//       banner,
//       status: 'pending', // Set default status to pending
//     });

//     const savedVendor = await vendor.save();
//     if (savedVendor) {
//       const cacheKey = `vendor:${savedVendor._id}`;
//       await client.set(cacheKey, JSON.stringify(savedVendor));
//       await client.del('all_vendors'); // Invalidate cache for all vendors list

//       sendSuccessResponse(res, savedVendor, 'Vendor added successfully');
//     } else {
//       throw new Error('Vendor could not be created');
//     }
//   } catch (error) {
//     sendErrorResponse(res, error);
//   }
// };

// // Vendor registration (similar to createVendor but may have different logic)
// export const registerVendor = async (req, res) => {
//   try {
//     const { firstName, lastName, phoneNumber, email, password, shopName, address } = req.body;
//     const { isValid, errors } = validateVendorInput(req.body);

//     if (!isValid) {
//       return sendErrorResponse(res, new Error(errors.join(', ')), 400);
//     }

//     const vendorImage = req.files?.vendorImage?.[0]?.path || null;
//     const logo = req.files?.logo?.[0]?.path || null;
//     const banner = req.files?.banner?.[0]?.path || null;

//     const newVendor = new Vendor({
//       firstName,
//       lastName,
//       phoneNumber,
//       email,
//       password,
//       shopName,
//       address,
//       vendorImage,
//       logo,
//       banner,
//       status: 'pending',
//     });

//     const savedVendor = await newVendor.save();
//     if (savedVendor) {
//       const cacheKey = `vendor:${savedVendor._id}`;
//       await client.set(cacheKey, JSON.stringify(savedVendor));
//       await client.del('all_vendors'); // Invalidate cache for all vendors list

//       sendSuccessResponse(res, savedVendor, 'Vendor registered successfully');
//     } else {
//       throw new Error('Vendor could not be registered');
//     }
//   } catch (error) {
//     sendErrorResponse(res, error);
//   }
// };

// // Vendor login
// export const loginVendor = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const vendor = await Vendor.findOne({ email });

//     if (!vendor) {
//       return sendErrorResponse(res, new Error('Vendor not found'), 404);
//     }

//     const isPasswordCorrect = password === vendor.password;
//     if (!isPasswordCorrect) {
//       return sendErrorResponse(res, new Error('Invalid credentials'), 400);
//     }

//     const token = jwt.sign(
//       { email: vendor.email, id: vendor._id },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_ACCESS_TIME }
//     );

//     sendSuccessResponse(res, { result: vendor, token }, 'Login successful');
//   } catch (error) {
//     sendErrorResponse(res, error);
//   }
// };

// // Update vendor status
// export const updateVendorStatus = async (req, res) => {
//   try {
//     const { vendorId } = req.params;
//     const { status } = req.body;

//     const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, { status }, { new: true });

//     if (!updatedVendor) {
//       return sendErrorResponse(res, new Error('Vendor not found'), 404);
//     }

//     const cacheKey = `vendor:${updatedVendor._id}`;
//     await client.set(cacheKey, JSON.stringify(updatedVendor));
//     await client.del('all_vendors'); // Invalidate cache for all vendors list

//     sendSuccessResponse(res, updatedVendor, 'Vendor status updated successfully');
//   } catch (error) {
//     sendErrorResponse(res, error);
//   }
// };

// // Get all vendors with search functionality
// // export const getAllVendors = async (req, res) => {
// //   try {
// //     const filters = req.query;
// //     const cacheKey = `all_vendors:${JSON.stringify(filters)}`;

// //     let cacheData = await client.get(cacheKey);
// //     if (cacheData) {
// //       try {
// //         cacheData = JSON.parse(cacheData);
// //         if (Array.isArray(cacheData)) {
// //           return sendSuccessResponse(res, cacheData, 'Vendors fetched successfully from cache');
// //         }
// //       } catch (error) {
// //         console.error(`Error parsing cached data: ${error.message}`);
// //       }
// //     }

// //     const query = applyVendorSearchFilters(filters);
// //     const vendors = await Vendor.find(query);

// //     if (vendors && vendors.length > 0) {
// //       await client.set(cacheKey, JSON.stringify(vendors));
// //     }

// //     sendSuccessResponse(res, vendors, 'Vendors fetched successfully');
// //   } catch (error) {
// //     sendErrorResponse(res, error);
// //   }
// // };

// // Get all vendors with search functionality
// export const getAllVendors = async (req, res) => {
//   try {
//     const filters = req.query;
//     const query = applyVendorSearchFilters(filters);
//     const vendors = await Vendor.find(query);

//     sendSuccessResponse(res, vendors, 'Vendors fetched successfully');
//   } catch (error) {
//     sendErrorResponse(res, error);
//   }
// };
// // Get vendor by ID
// export const getVendorById = async (req, res) => {
//   try {
//     const { vendorId } = req.params;
//     const cacheKey = `vendor:${vendorId}`;

//     let vendor = await client.get(cacheKey);
//     if (vendor) {
//       vendor = JSON.parse(vendor);
//     } else {
//       vendor = await Vendor.findById(vendorId);
//       if (vendor) {
//         await client.set(cacheKey, JSON.stringify(vendor));
//       } else {
//         return sendErrorResponse(res, new Error('Vendor not found'), 404);
//       }
//     }

//     sendSuccessResponse(res, vendor, 'Vendor fetched successfully');
//   } catch (error) {
//     sendErrorResponse(res, error);
//   }
// };

// // Delete vendor by ID
// export const deleteVendor = async (req, res) => {
//   try {
//     const { vendorId } = req.params;

//     const deletedVendor = await Vendor.findByIdAndDelete(vendorId);

//     if (!deletedVendor) {
//       return sendErrorResponse(res, new Error('Vendor not found'), 404);
//     }

//     const cacheKey = `vendor:${vendorId}`;
//     await client.del(cacheKey);
//     await client.del('all_vendors'); // Invalidate cache for all vendors list

//     sendSuccessResponse(res, { message: 'Vendor deleted successfully' }, 'Vendor deleted successfully');
//   } catch (error) {
//     sendErrorResponse(res, error);
//   }
// };

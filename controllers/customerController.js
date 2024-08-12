import Customer from "../models/customerModel.js";
import {
	createOne,
	deleteOne,
	getAll,
	getOne,
	updateOne,
} from "./handleFactory.js";

export const createCustomer = createOne(Customer);
export const getCustomers = getAll(Customer);
export const getCustomer = getOne(Customer);
export const deleteCustomer = deleteOne(Customer);
export const updateCustomer = updateOne(Customer);

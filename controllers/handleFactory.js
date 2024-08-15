import redisClient from "../config/redisConfig.js";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { getCacheKey } from "../utils/helpers.js";

export const deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		console.log(req.query);

		if (!doc) {
			return next(new AppError("No document found with that ID", 404));
		}

		// Invalidate the cache for this document
		const cacheKey = getCacheKey(Model.modelName, "", req.query);
		await redisClient.del(cacheKey);

		res.status(204).json({
			status: "success",
			doc: null,
		});
	});

export const updateOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!doc) {
			return next(new AppError("No document found with that ID", 404));
		}

		// Update cache
		const cacheKey = getCacheKey(Model.modelName, "", req.query);
		await redisClient.del(cacheKey);

		res.status(200).json({
			status: "success",
			doc,
		});
	});

export const createOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.create(req.body);

		// delete pervious cache
		const cacheKey = getCacheKey(Model.modelName, "", req.query);
		await redisClient.del(cacheKey);

		res.status(201).json({
			status: "success",
			doc,
		});
	});

export const getOne = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		const cacheKey = getCacheKey(Model.modelName, req.params.id);

		// Check cache first
		const cachedDoc = await redisClient.get(cacheKey);

		if (cachedDoc) {
			return res.status(200).json({
				status: "success",
				cached: true,
				doc: JSON.parse(cachedDoc),
			});
		}

		// If not in cache, fetch from database
		let query = Model.findById(req.params.id);
		if (popOptions && popOptions.path) query = query.populate(popOptions);
		const doc = await query;

		if (!doc) {
			return next(new AppError("No document found with that ID", 404));
		}

		// Cache the result
		await redisClient.setEx(cacheKey, 3600, JSON.stringify(doc));

		res.status(200).json({
			status: "success",
			cached: false,

			doc,
		});
	});

export const getAll = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		console.log(Model);

		const cacheKey = getCacheKey(Model.modelName, "", req.query);

		// Check cache first
		const cacheddoc = await redisClient.get(cacheKey);
		if (cacheddoc) {
			return res.status(200).json({
				status: "success",
				cached: true,
				results: JSON.parse(cacheddoc).length,
				doc: JSON.parse(cacheddoc),
			});
		}

		// EXECUTE QUERY
		let query = Model.find();

		// If popOptions is provided, populate the query
		if (popOptions && popOptions.path) {
			query = query.populate(popOptions);
		}

		// If not in cache, fetch from database
		const features = new APIFeatures(query, req.query)
			.filter()
			.sort()
			.fieldsLimit()
			.paginate();

		const doc = await features.query;

		// Cache the result
		await redisClient.setEx(cacheKey, 3600, JSON.stringify(doc));

		res.status(200).json({
			status: "success",
			cached: false,
			results: doc.length,
			doc,
		});
	});

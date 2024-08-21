import Product from '../models/productModel.js'
import { client } from '../utils/redisClient.js'
import {
    sendErrorResponse,
    sendSuccessResponse,
} from '../utils/responseHandler.js'
import { validateProductDependencies } from '../utils/validation.js'
import { populateProductDetails } from '../utils/productHelper.js'
import { buildFilterQuery, buildSortOptions } from '../utils/filterHelper.js'
import Customer from '../models/customerModel.js'
import { deleteOne, getAll, getOne } from './handleFactory.js'

// Create a new product
export const createProduct = async (req, res) => {
    try {
        // const { error } = productValidationSchema.validate(req.body, {
        // 	abortEarly: false,
        // });
        // if (error) {
        // 	return res
        // 		.status(400)
        // 		.json({ message: error.details.map((err) => err.message).join(", ") });
        // }

        const {
            name,
            description,
            category,
            subCategorySlug,
            subSubCategorySlug,
            brand,
            productType,
            digitalProductType,
            sku,
            unit,
            tags,
            price,
            discount,
            discountType,
            discountAmount,
            taxAmount,
            taxIncluded,
            minimumOrderQty,
            shippingCost,
            stock,
            isFeatured,
            colors,
            attributes,
            size,
            videoLink,
            userId,
            userType,
        } = req.body

        const {
            categoryObj,
            subCategoryObj,
            subSubCategoryObj,
            brandObj,
            colorObjs,
            attributeObjs,
        } = await validateProductDependencies({
            category,
            subCategorySlug,
            subSubCategorySlug,
            brand,
            colors,
            attributes,
        })

        const newProduct = new Product({
            name,
            description,
            category: categoryObj._id,
            subCategory: subCategoryObj ? subCategoryObj._id : undefined,
            subSubCategory: subSubCategoryObj
                ? subSubCategoryObj._id
                : undefined,
            brand: brandObj._id,
            productType,
            digitalProductType,
            sku,
            unit,
            tags,
            price,
            discount,
            discountType,
            discountAmount,
            taxAmount,
            taxIncluded,
            minimumOrderQty,
            shippingCost,
            stock,
            isFeatured: isFeatured || false,
            colors: colorObjs.map((color) => color._id),
            attributes: attributeObjs.map((attribute) => attribute._id),
            size,
            videoLink,
            userId,
            userType,
            thumbnail: req.files['thumbnail']
                ? req.files['thumbnail'][0].path
                : undefined,
            images: req.files['images']
                ? req.files['images'].map((file) => file.path)
                : [],
            status: 'pending',
        })
        await newProduct.save()
        sendSuccessResponse(res, 201, newProduct)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Update product images
export const updateProductImages = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        product.images = req.files ? req.files.map((file) => file.path) : []
        await product.save()
        await client.del(`product_${productId}`)
        sendSuccessResponse(res, 200, product)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// export const getAllProducts = async (req, res) => {
// 	try {
// 		const { priceRange, sort, order = "asc", page = 1, limit = 10 } = req.query;

// 		let query = buildFilterQuery(req.query);

// 		if (priceRange) {
// 			const [minPrice, maxPrice] = priceRange.split("-").map(Number);
// 			query.price = { $gte: minPrice, $lte: maxPrice };
// 		}

// 		let sortOptions = buildSortOptions(sort, order);
// 		const cacheKey = `products_${JSON.stringify(req.query)}`;
// 		const cachedProducts = await client.get(cacheKey);
// 		if (cachedProducts) {
// 			console.log("Returning cached products");
// 			return sendSuccessResponse(res, JSON.parse(cachedProducts), 200);
// 		}

// 		const skip = (page - 1) * limit;
// 		const products = await Product.find(query)
// 			.populate("category", "name")
// 			.populate("subCategory", "name")
// 			.populate("brand", "name")
// 			.populate("colors", "name")
// 			.populate("attributes", "name")
// 			.sort(sortOptions)
// 			.skip(skip)
// 			.limit(parseInt(limit));

// 		const totalDocs = await Product.countDocuments(query);
// 		const response = {
// 			products,
// 			totalDocs,
// 			limit: parseInt(limit),
// 			totalPages: Math.ceil(totalDocs / limit),
// 			page: parseInt(page),
// 			pagingCounter: skip + 1,
// 			hasPrevPage: page > 1,
// 			hasNextPage: page * limit < totalDocs,
// 			prevPage: page > 1 ? page - 1 : null,
// 			nextPage: page * limit < totalDocs ? page + 1 : null,
// 		};

// 		await client.set(cacheKey, JSON.stringify(response), "EX", 3600); // Cache for 1 hour

// 		// console.log('Returning products from database');
// 		sendSuccessResponse(res, response, 200);
// 	} catch (error) {
// 		// console.error('Error fetching products:', error);
// 		sendErrorResponse(res, error);
// 	}
// };
export const getAllProducts = getAll(Product)

export const getProductById = getOne(Product)
// Delete a Product
export const deleteProduct = deleteOne(Product)

// update product
// export const updateProduct = updateOne(Product)
// Add a new review to a product
export const addReview = async (req, res) => {
    try {
        console.log('review ')
        const productId = req.params.productId
        const { customer: customerId, review, rating } = req.body

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const customer = await Customer.findById(customerId)

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }

        product.reviews.push({
            customer: customerId,
            review,
            rating,
        })

        console.log(product)

        await product.save()
        await client.del(`product_${productId}`)
        sendSuccessResponse(res, product, 'Product Created Successfully')
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Update product status
export const updateProductStatus = async (req, res) => {
    try {
        const productId = req.params.id
        const { status } = req.body

        const validStatuses = ['active', 'inactive', 'pending']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        product.status = status
        await product.save()
        await client.del('all_products:*')
        await client.del(`product_${productId}`)
        sendSuccessResponse(res, product, 200)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Update product featured status
export const updateProductFeaturedStatus = async (req, res) => {
    try {
        const productId = req.params.id
        const { isFeatured } = req.body

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        product.isFeatured = isFeatured
        await product.save()
        await client.del('all_products:*')
        await client.del(`product_${productId}`)
        sendSuccessResponse(res, product, 200)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Get top-rated products
export const getTopRatedProducts = async (req, res) => {
    try {
        const topRatedProducts = await Product.aggregate([
            { $match: { status: 'active' } },
            { $unwind: '$reviews' },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    averageRating: { $avg: '$reviews.rating' },
                },
            },
            { $sort: { averageRating: -1 } },
            { $limit: 10 },
        ])

        sendSuccessResponse(res, 200, topRatedProducts)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Get products with limited stock
export const getLimitedStockedProducts = async (req, res) => {
    try {
        const limitThreshold = 10
        const cacheKey = 'limited_stocked_products'
        const cachedProducts = await client.get(cacheKey)

        if (cachedProducts) {
            return sendSuccessResponse(res, 200, JSON.parse(cachedProducts))
        }

        const limitedStockedProducts = await Product.find({
            stock: { $lte: limitThreshold },
            status: 'active',
        })
            .populate('category', 'name')
            .populate('subCategory', 'name')
            .populate('brand', 'name')

        await client.set(
            cacheKey,
            JSON.stringify(limitedStockedProducts),
            'EX',
            3600
        ) // Cache for 1 hour
        sendSuccessResponse(res, limitedStockedProducts, 200)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Mark product as sold
export const sellProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        product.status = 'sold'
        await product.save()
        sendSuccessResponse(res, product, 200)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Get product reviews
export const getProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId

        const product = await Product.findById(productId).populate(
            'reviews.customer',
            'name'
        )
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        sendSuccessResponse(res, product.reviews, 200)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Update review status
export const updateReviewStatus = async (req, res) => {
    try {
        const { productId, reviewId } = req.params
        const { status } = req.body

        const validStatuses = ['Active', 'Inactive']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const review = product.reviews.id(reviewId)
        if (!review) {
            return res.status(404).json({ message: 'Review not found' })
        }

        review.status = status
        await product.save()
        sendSuccessResponse(res, review, 200)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

// Update product details
export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id

        const { error } = productValidationSchema.validate(req.body, {
            abortEarly: false,
        })
        if (error) {
            return res.status(400).json({
                message: error.details.map((err) => err.message).join(', '),
            })
        }

        const {
            name,
            description,
            category,
            subCategorySlug,
            subSubCategorySlug,
            brand,
            productType,
            digitalProductType,
            sku,
            unit,
            tags,
            price,
            discount,
            discountType,
            discountAmount,
            taxAmount,
            taxIncluded,
            minimumOrderQty,
            shippingCost,
            stock,
            isFeatured,
            colors,
            attributes,
            size,
            videoLink,
            userId,
            userType,
        } = req.body

        const {
            categoryObj,
            subCategoryObj,
            subSubCategoryObj,
            brandObj,
            colorObjs,
            attributeObjs,
        } = await validateProductDependencies({
            category,
            subCategorySlug,
            subSubCategorySlug,
            brand,
            colors,
            attributes,
        })

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                name,
                description,
                category: categoryObj ? categoryObj._id : undefined,
                subCategory: subCategoryObj ? subCategoryObj._id : undefined,
                subSubCategory: subSubCategoryObj
                    ? subSubCategoryObj._id
                    : undefined,
                brand: brandObj ? brandObj._id : undefined,
                productType,
                digitalProductType,
                sku,
                unit,
                tags,
                price,
                discount,
                discountType,
                discountAmount,
                taxAmount,
                taxIncluded,
                minimumOrderQty,
                shippingCost,
                stock,
                isFeatured: isFeatured || false,
                colors: colorObjs
                    ? colorObjs.map((color) => color._id)
                    : undefined,
                attributes: attributeObjs
                    ? attributeObjs.map((attribute) => attribute._id)
                    : undefined,
                size,
                videoLink,
                userId,
                userType,
                status: 'pending',
            },
            { new: true }
        )

        await client.del('all_products:*')
        await client.del(`product_${productId}`)
        sendSuccessResponse(res, updatedProduct, 200)
    } catch (error) {
        sendErrorResponse(res, error)
    }
}

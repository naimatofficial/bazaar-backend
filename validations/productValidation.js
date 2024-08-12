import Joi from 'joi';

export  const productValidationSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.base': 'Product name should be a string',
        'string.empty': 'Product name is required',
        'any.required': 'Product name is required',
    }),
    description: Joi.string().required().messages({
        'string.base': 'Product description should be a string',
        'string.empty': 'Product description is required',
        'any.required': 'Product description is required',
    }),
    category: Joi.string().required().messages({
        'string.base': 'Category ID should be a string',
        'string.empty': 'Category ID is required',
        'any.required': 'Category ID is required',
    }),
    subCategorySlug: Joi.string().optional(),
    subSubCategorySlug: Joi.string().optional(),
    brand: Joi.string().required().messages({
        'string.base': 'Brand ID should be a string',
        'string.empty': 'Brand ID is required',
        'any.required': 'Brand ID is required',
    }),
    productType: Joi.string().required().messages({
        'string.base': 'Product type should be a string',
        'string.empty': 'Product type is required',
        'any.required': 'Product type is required',
    }),
    digitalProductType: Joi.string().optional(),
    sku: Joi.string().required().messages({
        'string.base': 'SKU should be a string',
        'string.empty': 'SKU is required',
        'any.required': 'SKU is required',
    }),
    unit: Joi.string().required().messages({
        'string.base': 'Unit should be a string',
        'string.empty': 'Unit is required',
        'any.required': 'Unit is required',
    }),
    tags: Joi.array().items(Joi.string()).optional(),
    price: Joi.number().required().positive().messages({
        'number.base': 'Price should be a number',
        'number.positive': 'Price should be greater than 0',
        'any.required': 'Price is required',
    }),
    discount: Joi.number().optional().positive(),
    discountType: Joi.string().valid('percent', 'flat').optional(),
    discountAmount: Joi.number().optional().positive(),
    taxAmount: Joi.number().optional().positive(),
    taxIncluded: Joi.boolean().required().messages({
        'boolean.base': 'Tax inclusion status should be a boolean',
        'any.required': 'Tax inclusion status is required',
    }),
    shippingCost: Joi.number().optional().positive(),
    minimumOrderQty: Joi.number().required().positive().messages({
        'number.base': 'Minimum order quantity should be a number',
        'number.positive': 'Minimum order quantity should be greater than 0',
        'any.required': 'Minimum order quantity is required',
    }),
    stock: Joi.number().required().positive().messages({
        'number.base': 'Stock should be a number',
        'number.positive': 'Stock should be greater than 0',
        'any.required': 'Stock is required',
    }),
    isFeatured: Joi.boolean().optional(),
    colors: Joi.array().items(Joi.string()).optional(),
    attributes: Joi.array().items(Joi.string()).optional(),
    size: Joi.string().optional(),
    videoLink: Joi.string().uri().optional(),
    userId: Joi.string().required().messages({
        'string.base': 'User ID should be a string',
        'string.empty': 'User ID is required',
        'any.required': 'User ID is required',
    }),
    userType: Joi.string().valid('vendor', 'admin').required().messages({
        'string.base': 'User type should be a string',
        'any.only': 'User type should be either "vendor" or "admin"',
        'any.required': 'User type is required',
    }),
    thumbnail: Joi.string().optional(),
    images: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
});



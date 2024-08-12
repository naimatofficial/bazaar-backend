import Joi from 'joi';

export const flashDealValidationSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.base': 'Title should be a string',
        'string.empty': 'Title is required',
        'any.required': 'Title is required',
    }),
    startDate: Joi.date().required().messages({
        'date.base': 'Start date should be a valid date',
        'any.required': 'Start date is required',
    }),
    endDate: Joi.date().required().messages({
        'date.base': 'End date should be a valid date',
        'any.required': 'End date is required',
    }),
    // image: Joi.string().required().messages({
    //     'string.base': 'Image path should be a string',
    //     'string.empty': 'Image is required',
    //     'any.required': 'Image is required',
    // }),
    status: Joi.string().valid('active', 'expired', 'inactive').default('inactive').messages({
        'string.base': 'Status should be a string',
        'any.only': 'Status should be one of "active", "expired", "inactive"',
    }),
    publish: Joi.boolean().default(false).messages({
        'boolean.base': 'Publish status should be a boolean',
    }),
    activeProducts: Joi.number().integer().min(0).default(0).messages({
        'number.base': 'Active products should be a number',
        'number.integer': 'Active products should be an integer',
        'number.min': 'Active products should be at least 0',
    }),
    productId: Joi.array().items(Joi.string()).optional().messages({
        'array.base': 'Product ID should be an array',
        'string.base': 'Each product ID should be a string',
    }),
});

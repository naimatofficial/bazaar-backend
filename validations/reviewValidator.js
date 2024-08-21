import Joi from 'joi'

const reviewValidationSchema = Joi.object({
    product: Joi.string().required().messages({
        'any.required': 'Product ID is required',
        'string.base': 'Product ID must be a string',
    }),
    customer: Joi.string().required().messages({
        'any.required': 'Customer ID is required',
        'string.base': 'Customer ID must be a string',
    }),
    review: Joi.string().required().messages({
        'any.required': 'Review is required',
        'string.base': 'Review must be a string',
        'string.empty': 'Review cannot be empty',
    }),
    rating: Joi.number().min(1).max(5).required().messages({
        'any.required': 'Rating is required',
        'number.base': 'Rating must be a number',
        'number.min': 'Rating must be at least 1',
        'number.max': 'Rating cannot be more than 5',
    }),
    status: Joi.string()
        .valid('active', 'inactive')
        .default('active')
        .messages({
            'string.base': 'Status must be a string',
            'any.only': 'Invalid status',
        }),
})

export default reviewValidationSchema

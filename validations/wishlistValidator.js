import Joi from 'joi'

const wishlistValidationSchema = Joi.object({
    userId: Joi.string().required().messages({
        'any.required': 'User ID is required',
        'string.base': 'User ID must be a string',
        'string.empty': 'User ID cannot be empty.',
    }),
    productId: Joi.string().required().messages({
        'any.required': 'Product ID is required',
        'any.base': 'Product ID must be a string',
        'string.empty': 'Product ID cannot be empty.',
    }),
})

export default wishlistValidationSchema

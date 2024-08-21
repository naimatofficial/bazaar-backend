import Joi from 'joi'

const wishlistValidationSchema = Joi.object({
    user: Joi.string().required().messages({
        'any.required': 'User ID is required',
        'string.base': 'User ID must be a string',
    }),
    products: Joi.array()
        .items(
            Joi.string().required().messages({
                'any.required': 'Product ID is required',
                'string.base': 'Product ID must be a string',
            })
        )
        .required()
        .messages({
            'any.required': 'Products are required',
        }),
})

export default wishlistValidationSchema

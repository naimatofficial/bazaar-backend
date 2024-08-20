const Joi = require('joi')

const categoryValidationSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Please provide category name.',
    }),
    logo: Joi.string().required().messages({
        'string.empty': 'Please provide category logo.',
    }),
    priority: Joi.number().optional(),
})

export default categoryValidationSchema

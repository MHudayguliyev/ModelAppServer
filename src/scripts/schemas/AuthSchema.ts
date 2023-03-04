const joi = require('joi')


const LoginSchema = joi.object({
    username: joi.string().required().min(3).max(25).label("Username").messages({
        "string.pattern.base": '{#label} not suitable',
        'string.min': '{#label} should have 3 letter at least',
        'string.max': '{#label} should have 15 letter at more',
        'any.required': '{#label} required'
    }),
    password: joi.string().required().min(3).label("Password").messages({
        "string.pattern.base": '{#label} not suitable',
        'string.min': '{#label} should have 3 letter at least',
        'any.required': '{#label} required'
    })
})

module.exports = LoginSchema
const joi = require('joi')
export {}


const UploadSchema = joi.object({
    cate_id: joi.string().required().min(0).max(36).label('Category guid').messages({
        "string.base": "{#label} must be a string",
        "string.pattern.base": "{#label} incompatible",
        "string.empty": "{#label} should not be empty",
        "any.required": "{#label} is required",
    }),
    model_name_tm: joi.string().allow('', null).label('Model name in tm').messages({
        "string.base": "{#label} must be a string",
        "string.pattern.base": "{#label} incompatible",
    }),
    model_name_ru: joi.string().allow('', null).label('Model name in ru').messages({
        "string.base": "{#label} must be a string",
        "string.pattern.base": "{#label} incompatible",
    }),
    model_name_en: joi.string().allow('', null).label('Model name in en').messages({
        "string.base": "{#label} must be a string",
        "string.pattern.base": "{#label} incompatible",
    }),
    model_price: joi.number().required().label('Model price').messages({
        'number.base': '{#label} must be a number',
        'number.pattern.base': '{#label} incomaptible',
        'any.required': '{#label} required',
        'number.empty': '{#label} should not be empty',
    }),
    model_desc: joi.string().allow("", null)
})

const EditModelSchema = joi.object({
    md_guid: joi.string().required().label('Model id').messages({
        "string.base": "{#label} must be string",
        "string.pattern.base": "{#label} isn't suitable",
        "string.empty": "{#label} is empty",
        "string.required": "{#label} is required!"
    }),
    md_name: joi.string().required().label('New model name').messages({
        "string.base": "{#label} must be string",
        "string.pattern.base": "{#label} isn't suitable",
        "string.required": "{#label} is required!"
    }),
    md_price: joi.number().required().label('New model price').messages({
        "number.base": "{#label} must be number",
        "number.required": "{#label} is required!"
    }),
    md_desc: joi.string().allow('', null)
})

module.exports = {UploadSchema, EditModelSchema}
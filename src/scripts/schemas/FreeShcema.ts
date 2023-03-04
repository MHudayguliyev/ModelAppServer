export {}
const joi = require('joi')

const GetModelsShcema = joi.object({
    parent_guid: joi.string().required().min(0).max(36).regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i).label('Parent_guid').messages({
        "string.pattern.base": "{#label} should be a string",
        "any.required": "{#label} is required!"      
    })
})

module.exports = GetModelsShcema
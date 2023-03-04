export {};
const statuses = require('./statuses')
const { Response,Request } = require('express')

const SchemaValidate = (schema: any) => (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body)
    if(error){
        res.status(statuses.bad).json({
            error: error.details[0].message
        })
        return        
    }
    Object.assign(req.body, value)
    return next()
}

const UploadValidate = (schema: any) => (req: typeof Request, res: typeof Response, next: any) => {
    const{error, value} = schema.validate(req.query)
    if(error){
        res.status(statuses.bad).json({
            error: error.details[0].message
        })
        return        
    }
    Object.assign(req.body, value)
    return next()
}


module.exports = {SchemaValidate, UploadValidate}
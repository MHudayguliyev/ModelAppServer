export {}
const router = require('express').Router()
const {Upload, GetFormats, GetClasses} = require('../controller/UploadController')
const ImageUpload = require('../scripts/multerConfig/index')
const {UploadValidate, SchemaValidate} = require('../scripts/utils/Validation')
const {UploadSchema, EditModelSchema} = require('../scripts/schemas/UploadSchema')
const Authenticate = require('../scripts/helpers/Authenticate')

// UploadValidate(UploadSchema),

// posts
router.route('/file').post(Authenticate,  ImageUpload, Upload)

// gets
router.route('/model-formats').get(Authenticate, GetFormats)
router.route('/model-classes').get(Authenticate, GetClasses)


module.exports = router
export {}
const router = require('express').Router()
const Authenticate = require('../scripts/helpers/Authenticate')
const {AdminModels, SaveChanges, UploadModel, DeleteUnacceptedModel} = require('../controller/AdminController')
const FileUpload = require('../scripts/multerConfig/index')


router.route('/admin-models').get(Authenticate, AdminModels)
router.route('/save-changes').post(Authenticate, FileUpload, SaveChanges)
router.route('/upload-model/:modelGuid').put(Authenticate, UploadModel)
router.route('/delete-unaccepted-model/:modelGuid').delete(Authenticate, DeleteUnacceptedModel)

module.exports = router
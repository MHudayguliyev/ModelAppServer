export {}
const router = require('express').Router()
const { GetModelForEdit, DeletePublicData, SendEmail } = require('../controller/General')
const Authenticate = require('../scripts/helpers/Authenticate')


router.route('/model-for-edit').get(Authenticate, GetModelForEdit)
router.route('/delete-public-data').get(Authenticate, DeletePublicData)
router.route('/send-email').post(Authenticate, SendEmail)


module.exports = router
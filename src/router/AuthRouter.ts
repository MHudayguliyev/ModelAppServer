export {};
const router = require('express').Router()
const {SchemaValidate} = require('../scripts/utils/Validation')
const LoginSchema = require('../scripts/schemas/AuthSchema')
const {Login, LoadUser} = require('../controller/AuthController')


router.route('/load-user').get(LoadUser)
router.route('/login').post(SchemaValidate(LoginSchema), Login)

module.exports = router
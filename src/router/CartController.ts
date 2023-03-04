export {}
const router = require('express').Router()
const Authenticate = require('../scripts/helpers/Authenticate')
const {GetSelectedModel, GetRecommendations} = require('../controller/CartController')


router.route('/selected-model').get(Authenticate, GetSelectedModel)
router.route('/recomendations').get(Authenticate, GetRecommendations)

module.exports = router

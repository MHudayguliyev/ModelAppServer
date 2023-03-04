const router = require('express').Router()
const { GetCategories, GetModels, GlobalSearch, GetSelectedModel, GetOfSameCategories } = require('../controller/FreeController')
const Authenticate = require('../scripts/helpers/Authenticate')


router.route('/search').get(Authenticate, GlobalSearch)
router.route('/categories').get(Authenticate, GetCategories)
router.route('/models').get(Authenticate, GetModels)
router.route('/selected-model/:modelGuid').get(Authenticate,GetSelectedModel)
router.route('/recomendation-models/:modelGuid/:categoryGuid').get(Authenticate,GetOfSameCategories)


module.exports = router

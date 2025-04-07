const Router = require('express')
const router = new Router()
const objectController = require('../controller/object.controller')

router.get('/getallcategories', objectController.getAllCategories)
router.get('/getallobjects', objectController.getAllObjects)
router.post('/getallobjectsbycategory', objectController.getAllObjectsByCategory)
router.post('/addnewobject', objectController.createObject)
router.delete('/deleteobject', objectController.deleteObject)
router.put('/updateobject', objectController.updateObject)
router.post('/getcurrentobject', objectController.getCurrentObject)
router.post('/addtofavor', objectController.addObjectToFavourite)
router.delete('/deletefromfavor', objectController.deleteObjectToFavourite)


router.post('/createreview', objectController.createReview)
router.get('/getallreviews', objectController.getAllReviews)
router.post('/getcurrentreview', objectController.getAllReviewsForCurrentObject)
router.delete('/deletereview', objectController.deleteReview)
router.put('/applyreview', objectController.applyReview)

module.exports = router
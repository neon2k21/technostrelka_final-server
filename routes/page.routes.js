const Router = require('express')
const router = new Router()
const PageController = require('../controller/page.controller')

router.post('/createPage', PageController.createPage)
router.post('/getPage', PageController.getPage)
router.delete('/deletePage', PageController.deletePage)


module.exports = router
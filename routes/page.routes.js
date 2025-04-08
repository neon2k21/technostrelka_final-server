const Router = require('express')
const router = new Router()
const PageController = require('../controller/page.controller')

router.post('/createPost', PageController.createPage)
router.post('/getPost', PageController.deletePage)
router.delete('/deletePost', PageController.getPage)


module.exports = router
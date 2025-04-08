const Router = require('express')
const router = new Router()
const PostController = require('../controller/post.controller')

router.post('/createPost', PostController.createPost)
router.post('/getPost', PostController.deletePost)
router.delete('/deletePost', PostController.getPost)


module.exports = router
const Router = require('express')
const router = new Router()
const PostController = require('../controller/post.controller')

router.post('/createPost', PostController.createPost)
router.get('/getPost', PostController.getPost)
router.delete('/deletePost', PostController.deletePost)
router.get('/getAllPost', PostController.getAllPost)

module.exports = router
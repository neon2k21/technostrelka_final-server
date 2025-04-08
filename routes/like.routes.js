const Router = require('express')
const router = new Router()
const LikeController = require('../controller/like.controller')

router.post('/createLike', LikeController.createLike)
router.post('/deleteLike', LikeController.deleteLike)


module.exports = router
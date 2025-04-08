const Router = require('express')
const router = new Router()
const userController = require('../controller/user.controller')

router.post('/createUser', userController.createUser)
router.get('/getUser', userController.getUser)
router.delete('/deleteUser', userController.deleteUser)
router.put('/updateNick', userController.setUserNickname)
router.post('/percent', userController.calculatePercentByTopic)
router.get('/getAllUserforlist', userController.getAllUserforlist)

module.exports = router


const Router = require('express')
const router = new Router()
const userController = require('../controller/user.controller')

router.post('/createUser', userController.createUser)
router.post('/getUser', userController.getUser)
router.delete('/deleteUser', userController.deleteUser)
router.put('/updateNick', userController.setUserNickname)
router.post('/calculatePercentByTopic', userController.calculatePercentByTopic)
router.get('/getAllUserforlist', userController.getAllUserforlist)
router.get('/getPercent',userController.getPercent)
router.get('/getInfobyProfily', userController.getInfobyProfily)
router.post('/insertCompletedCourse', userController.insertCompletedCourse)

module.exports = router


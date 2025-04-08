const Router = require('express')
const router = new Router()
const userController = require('../controller/user.controller')

router.post('/createUser', userController.createUser)
router.post('/getUser', userController.getUser)
router.delete('/deleteUser', userController.deleteUser)
router.put('/updateNick', userController.setUserNickname)



module.exports = router


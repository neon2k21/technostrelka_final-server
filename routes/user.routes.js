const Router = require('express')
const router = new Router()
const userController = require('../controller/user.controller')

router.post('/user', userController.createUser)
router.post('/getuser', userController.getUser)
router.post('/getusernickname',userController.getUserNickName)
router.post('/getuserlikes',userController.getLikedPubs)
router.post('/getuserfavor',userController.getFavouriteObject)
router.delete('/user', userController.deleteUser)
router.put('/setusertoken', userController.setUserToken)
router.put('/setNewAvatar', userController.setUserAvatar)


module.exports = router


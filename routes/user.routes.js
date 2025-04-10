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
//Completed_course
router.post('/insertCompletedCourse', userController.insertCompletedCourse)
router.post('/getCompletedCursebyUser', userController.getCompletedCursebyUser)

router.post('/addCourseToProcess', userController.addCourseToProcess); // Добавление курса в процесс изучения
router.post('/processcourses', userController.getProcessCoursesByUser); // Получение текущих курсов пользователя
router.post('/completecourse', userController.completeCourse); // Завершение курса и перемещение в completed_course
module.exports = router


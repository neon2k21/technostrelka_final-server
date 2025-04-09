const Router = require('express')
const router = new Router()
const courseController = require('../controller/curses.controller')

router.post('/createCourse', courseController.createCourse)
router.post('/getCourse', courseController.getCourse)
router.delete('/deleteCourse', courseController.deleteCourse)
router.get('/getAllCourse', courseController.getAllCourse)


module.exports = router
const Router = require('express')
const router = new Router()
const courseController = require('../controller/curses.controller')

router.post('/createCourse', courseController.createCourse)
router.get('/getCourse', courseController.getCourse)
router.delete('/deleteCourse', courseController.deleteCourse)


module.exports = router
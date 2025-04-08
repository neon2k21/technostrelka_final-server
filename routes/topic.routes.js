const Router = require('express')
const router = new Router()
const TopicController = require('../controller/topic.controller')

router.post('/createTopic', TopicController.createTopic)
router.get('/getTopic', TopicController.deleteTopic)
router.delete('/deleteTopic', TopicController.getTopic)
router.get('/getAllTopic', TopicController.getAllTopic)

module.exports = router
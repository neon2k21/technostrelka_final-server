const Router = require('express')
const router = new Router()
const TopicController = require('../controller/topic.controller')

router.post('/createTopic', TopicController.createTopic)
router.post('/getTopic', TopicController.deleteTopic)
router.delete('/deleteTopic', TopicController.getTopic)


module.exports = router
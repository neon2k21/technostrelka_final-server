const Router = require('express')
const router = new Router()
const KvizController = require('../controller/kviz.controller')

router.post('/createKviz', KvizController.createKviz)
router.post('/getKviz', KvizController.deleteKviz)
router.delete('/deleteKviz', KvizController.getKviz)


module.exports = router
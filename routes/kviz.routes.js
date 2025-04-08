const Router = require('express')
const router = new Router()
const KvizController = require('../controller/kviz.controller')

router.post('/createKviz', KvizController.createKviz)
router.get('/getKviz', KvizController.getKviz)
router.delete('/deleteKviz', KvizController.deleteKviz)


module.exports = router
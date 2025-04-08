const Router = require('express')
const router = new Router()
const KvizController = require('../controller/kviz.controller')

router.post('/createKviz', KvizController.createKviz)
router.get('/getKviz', KvizController.getKviz)
router.delete('/deleteKviz', KvizController.deleteKviz)
router.post('/completeKviz', KvizController.completeKviz)
router.post('/getSplashKviz', KvizController.getSplashKviz)
router.get('/getAllKviz', KvizController.getAllKviz)
router.post('/getPageKviz', KvizController.getPageKviz)

module.exports = router
const Router = require('express');
const router = new Router();
const postLikesController = require('../controller/like.controller.js');
const likeController = require('../controller/like.controller.js');

// Маршрут для изменения лайка
router.post('/changeLike', postLikesController.changeLike);

// Маршрут для проверки лайка
router.post('/checkLike', async (req, res) => {
    try {
        const { posts_id, user_id } = req.body;

        // Проверяем, что переданы необходимые параметры
        if (!posts_id || !user_id) {
            return res.status(400).json({ error: "Необходимо указать posts_id и user_id" });
        }

        // Вызываем функцию checkLike из контроллера
        const isLiked = await postLikesController.checkLike(posts_id, user_id);

        // Возвращаем результат
        return res.status(200).json({
            message: "Лайк проверен",
            isLiked: isLiked
        });
    } catch (error) {
        console.error("Ошибка при проверке лайка:", error);
        return res.status(500).json({ error: "Ошибка сервера", details: error.message });
    }
});
router.post('/getPostLikes', likeController.getPostLikes)
// Маршрут для получения лайков поста
router.delete('/removeorphanedlikes', likeController.removeOrphanedLikes);


module.exports = router;
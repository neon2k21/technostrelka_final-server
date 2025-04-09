const db = require('../config');

class LikeController {
    constructor() {
        // Привязка контекста для методов
        this.changeLike = this.changeLike.bind(this);
    }

    // Используем стрелочную функцию для сохранения контекста
    checkLike = async (post_id, user_id) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM likes WHERE posts_id = ? AND user_id = ?`;
            db.get(query, [post_id, user_id], (err, row) => {
                if (err) {
                    console.error("Ошибка при проверке лайка:", err);
                    return reject(err);
                }
                resolve(!!row); // Возвращаем true, если запись найдена, и false, если нет
            });
        });
    };

    // Универсальная функция для добавления/удаления лайка
    changeLike = async (req, res) => {
        const { posts_id, user_id } = req.body;

        // Проверяем, что переданы обязательные поля
        if (!posts_id || !user_id) {
            return res.status(400).json({ message: "Поля posts_id и user_id обязательны" });
        }

        try {
            // Проверяем, существует ли лайк
            const isLiked = await this.checkLike(posts_id, user_id);

            if (isLiked) {
                // Удаление лайка
                db.run(
                    "DELETE FROM likes WHERE posts_id = ? AND user_id = ?",
                    [posts_id, user_id],
                    function (err) {
                        if (err) {
                            console.error("Ошибка удаления:", err);
                            return res.status(500).json({ message: "Ошибка удаления" });
                        }

                        if (this.changes === 0) {
                            return res.status(404).json({ message: "Лайк не найден" });
                        }

                        res.status(200).json({ message: "Лайк удалён" });
                    }
                );
            } else {
                // Добавление лайка
                db.run(
                    "INSERT INTO likes (posts_id, user_id) VALUES (?, ?)",
                    [posts_id, user_id],
                    function (err) {
                        if (err) {
                            console.error("Ошибка добавления:", err);
                            return res.status(500).json({ message: "Ошибка добавления" });
                        }

                        res.status(201).json({ id: this.lastID, message: "Лайк добавлен" });
                    }
                );
            }
        } catch (error) {
            console.error("Критическая ошибка:", error);
            res.status(500).json({ message: "Ошибка при обработке лайка" });
        }
    };

    // Получить все лайки для поста
    async getPostLikes(req, res) {
        const { posts_id } = req.body;
        const query = `SELECT * FROM likes WHERE posts_id = ?`;

        db.all(query, [posts_id], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Ошибка получения лайков' });
            }
            res.status(200).json(rows);
        });
    }

    // Удаление "висячих" лайков
    removeOrphanedLikes = async (req, res) => {
        try {
            const query = `
                DELETE FROM likes
                WHERE posts_id NOT IN (SELECT id FROM posts);
            `;

            db.run(query, [], function (err) {
                if (err) {
                    console.error("Ошибка при удалении висячих лайков:", err);
                    return res.status(500).json({ message: "Ошибка сервера", details: err.message });
                }

                res.status(200).json({
                    message: "Висячие лайки успешно удалены",
                    removed_count: this.changes
                });
            });
        } catch (error) {
            console.error("Критическая ошибка:", error);
            res.status(500).json({ message: "Внутренняя ошибка сервера", details: error.message });
        }
    };
}

module.exports = new LikeController();
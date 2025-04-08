const db = require('../config')

class LikeController{
    async createLike(req, res) {
        const { user_id, post_id } = req.body;
    
            const insertSql = `INSERT INTO pages (user_id, post_id) VALUES (?,?)`;
    
            db.run(insertSql, [user_id, post_id], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при создании like', details: err });
                }
    
                return res.status(201).json({
                    message: 'like успешно создана',
                    like_id: this.lastID
                });
            });
    }
    
    async deleteLike(req, res) {
        const { id } = req.body;
    
        const sql = `DELETE FROM likes WHERE id = ?`;
    
        db.run(sql, [id], function (err) {
            if (err) return res.status(500).json({ error: 'Ошибка при удалении like', details: err });
    
            if (this.changes === 0) {
                return res.status(404).json({ message: 'like не найдена' });
            }
    
            res.status(200).json({ message: 'like удалёна' });
        });
    }
}

module.exports = new LikeController()
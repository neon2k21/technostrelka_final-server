const db = require('../config')

class PostController{
    async createPost(req, res) {
        const { description, image } = req.body;
    
            const insertSql = `INSERT INTO posts ( description, image) VALUES (?,?,?)`;
    
            db.run(insertSql, [name, description, image], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при создании поста', details: err });
                }
    
                return res.status(201).json({
                    message: 'Пост успешно создана',
                    post_id: this.lastID
                });
            });
    }
    
    async deletePost(req, res) {
        const { id } = req.body;
    
        const sql = `DELETE FROM posts WHERE id = ?`;
    
        db.run(sql, [id], function (err) {
            if (err) return res.status(500).json({ error: 'Ошибка при удалении поста', details: err });
    
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Пост не найден' });
            }
    
            res.status(200).json({ message: 'Пост удалёна' });
        });
    }

    async getPost(req,res){
        const { id } = req.body
        const sql = (
            `select * from posts where (id);`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
            else res.json(rows)
    })
    }
    

}

module.exports = new PostController()
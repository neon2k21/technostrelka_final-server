const db = require('../config')

class PostController{
    async createPost(req, res) {
        const { description, topic_id, image } = req.body;
    
            const insertSql = `INSERT INTO posts ( description, topic_id, image) VALUES (?,?,?)`;
    
            db.run(insertSql, [ description, topic_id, image], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при создании поста', details: err.message});
                }
    
                return res.status(201).json({
                    message: 'Пост успешно создан',
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

    async getAllPost(req, res) {
        const sql = `
            SELECT 
                posts.id AS post_id,
                posts.description AS post_description,
                posts.image AS post_image,
                topics.name AS topic_name
            FROM 
                posts
            LEFT JOIN 
                topics ON posts.topic_id = topics.id;
        `;
        db.all(sql, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при получении постов', details: err });
            }
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Посты не найдены' });
            } else {
                return res.json(rows);
            }
        });
    }
    
    

}

module.exports = new PostController()
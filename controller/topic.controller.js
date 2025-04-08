const db = require('../config')

class TopicController{
    async createTopic(req, res) {
        const { name } = req.body;
    
        if (!name) {
            return res.status(400).json({ error: 'Название темы обязательно' });
        }
    
        const checkSql = `SELECT * FROM topics WHERE name = ?`;
    
        db.all(checkSql, [name], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при проверке темы', details: err });
            }
    
            if (rows.length > 0) {
                return res.status(400).json({ error: 'Такая тема уже существует' });
            }
    
            const insertSql = `INSERT INTO topics (name) VALUES (?)`;
    
            db.run(insertSql, [name], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при создании темы', details: err });
                }
    
                return res.status(201).json({
                    message: 'Тема успешно создана',
                    topic_id: this.lastID
                });
            });
        });
    }
    
    async deleteTopic(req, res) {
        const { id } = req.body;
    
        const sql = `DELETE FROM topics WHERE id = ?`;
    
        db.run(sql, [id], function (err) {
            if (err) return res.status(500).json({ error: 'Ошибка при удалении темы', details: err });
    
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Тема не найден' });
            }
    
            res.status(200).json({ message: 'Тема удалёна' });
        });
    }

    async getTopic(req,res){
        const { id } = req.body
        const sql = (
            `select * from topics where (id);`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
            else res.json(rows)
    })
    }
    

}

module.exports = new TopicController()
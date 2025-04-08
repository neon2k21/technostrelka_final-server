const db = require('../config')

class courseController{
    async createCourse(req, res) {
        const { name, description, topic_id, preview } = req.body;
    
            const insertSql = `INSERT INTO curses (name, description, topic_id, preview) VALUES (?,?,?,?)`;
    
            db.run(insertSql, [name, description, topic_id, preview], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при создании курса', details: err });
                }
    
                return res.status(201).json({
                    message: 'Страница успешно создана',
                    course_id: this.lastID
                });
            });
    }
    
    async deleteCourse(req, res) {
        const { id } = req.body;
    
        const sql = `DELETE FROM curses WHERE id = ?`;
    
        db.run(sql, [id], function (err) {
            if (err) return res.status(500).json({ error: 'Ошибка при удалении страницы', details: err });
    
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Курс не найдена' });
            }
    
            res.status(200).json({ message: 'Курс удалён' });
        });
    }

    async getCourse(req,res){
        const { id } = req.body
        const sql = (
            `select * from curses where (id);`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
            else res.json(rows)
    })
    }
}

module.exports = new courseController()
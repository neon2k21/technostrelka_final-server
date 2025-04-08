const db = require('../config')

class PageController{
    async createPage(req, res) {
        const { course_id, title, type, value, order } = req.body;
    
            const insertSql = `INSERT INTO pages (course_id, title, type, value, order) VALUES (?,?,?,?,?)`;
    
            db.run(insertSql, [course_id, title, type, value, order], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при создании страницы', details: err });
                }
    
                return res.status(201).json({
                    message: 'Страница успешно создана',
                    page_id: this.lastID
                });
            });
    }
    
    async deletePage(req, res) {
        const { id } = req.body;
    
        const sql = `DELETE FROM page WHERE id = ?`;
    
        db.run(sql, [id], function (err) {
            if (err) return res.status(500).json({ error: 'Ошибка при удалении страницы', details: err });
    
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Страница не найдена' });
            }
    
            res.status(200).json({ message: 'Страница удалёна' });
        });
    }

    async getPage(req,res){
        const { id } = req.body
        const sql = (
            `select * from pages where (id);`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
            else res.json(rows)
    })
    }
}

module.exports = new PageController()
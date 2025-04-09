const db = require('../config')

class PageController{
    async createPage(req, res) {
        try {
            const { course_id, name, blocks, order } = req.body;
    
            // Проверяем, что все обязательные поля переданы
            if (!course_id || !name || !Array.isArray(blocks) || order === undefined) {
                return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля' });
            }
    
            // Проверяем, что каждый блок содержит type и content
            for (const block of blocks) {
                if (!block.type || !block.content) {
                    return res.status(400).json({ error: 'Каждый блок должен содержать поля type и content' });
                }
            }
    
            // Преобразуем массив блоков в JSON-строку
            const blocksJson = JSON.stringify(blocks);
    
            // SQL-запрос для создания страницы
            const insertSql = `
                INSERT INTO pages (course_id, name, blocks, "order")
                VALUES (?, ?, ?, ?);
            `;
    
            db.run(insertSql, [course_id, name, blocksJson, order], function (err) {
                if (err) {
                    console.error('Ошибка при создании страницы:', err);
                    return res.status(500).json({ error: 'Ошибка при создании страницы', details: err.message });
                }
    
                return res.status(201).json({
                    message: 'Страница успешно создана',
                    page_id: this.lastID
                });
            });
        } catch (error) {
            console.error('Неожиданная ошибка:', error);
            return res.status(500).json({ error: 'Неожиданная ошибка сервера', details: error.message });
        }
    }
    
    async deletePage(req, res) {
        const { id } = req.body;
    
        const sql = `DELETE FROM pages WHERE id = ?`;
    
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
            `select * from pages where (id=?);`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
            else res.json(rows)
    })
    }
}

module.exports = new PageController()
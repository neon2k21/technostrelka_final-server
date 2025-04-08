const db = require('../config')

class KvizController{
    async createKviz(req, res) {
        const { name, questions, answers } = req.body;
    
            const insertSql = `INSERT INTO kviz (name, questions, answers) VALUES (?,?,?)`;
    
            db.run(insertSql, [name, questions, answers], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при создании квиза', details: err });
                }
    
                return res.status(201).json({
                    message: 'Квиз успешно создана',
                    kviz_id: this.lastID
                });
            });
    }
    
    async deleteKviz(req, res) {
        const { id } = req.body;
    
        const sql = `DELETE FROM kviz WHERE id = ?`;
    
        db.run(sql, [id], function (err) {
            if (err) return res.status(500).json({ error: 'Ошибка при удалении квиза', details: err });
    
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Квиз не найдена' });
            }
    
            res.status(200).json({ message: 'Квиз удалёна' });
        });
    }

    async getKviz(req,res){
        const { id } = req.body
        const sql = (
            `select * from kviz where (id);`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
            else res.json(rows)
    })
    }
}

module.exports = new KvizController()
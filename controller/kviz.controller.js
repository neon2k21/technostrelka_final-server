const db = require('../config')

class KvizController{
    async createKviz(req, res) {
        try {
            const { name, questions, reward } = req.body;
    
            // Проверяем, переданы ли все обязательные поля
            if (!name || !questions ||  reward === undefined) {
                return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля' });
            }
    
            // Преобразуем questions в JSON-строку
            let questionsJson;
            try {
                questionsJson = JSON.stringify(questions);
            } catch (error) {
                return res.status(400).json({ error: 'Неверный формат данных для questions. Ожидается объект или массив.' });
            }
    
            // SQL-запрос для создания квиза
            const insertSql = `
                INSERT INTO kviz (name, questions, reward)
                VALUES (?, ?, ?)
            `;
    
            db.run(insertSql, [name, questionsJson, reward], function (err) {
                if (err) {
                    console.error('Ошибка при создании квиза:', err);
                    return res.status(500).json({ error: 'Ошибка при создании квиза', details: err.message });
                }
    
                return res.status(201).json({
                    message: 'Квиз успешно создан',
                    kviz_id: this.lastID
                });
            });
        } catch (error) {
            console.error('Неожиданная ошибка:', error);
            return res.status(500).json({ error: 'Неожиданная ошибка сервера', details: error.message });
        }
    }
    
    async deleteKviz(req, res) {
        const { id } = req.body;
    
        const sql = `DELETE FROM kviz WHERE id = ?`;
    
        db.run(sql, [id], function (err) {
            if (err) return res.status(500).json({ error: 'Ошибка при удалении квиза', details: err.message });
    
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Квиз не найдена' });
            }
    
            res.status(200).json({ message: 'Квиз удалёна' });
        });
    }

    async getKviz(req,res){
        const { id } = req.body
        const sql = (
            `select * from kviz where (id=?);`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
            else res.json(rows)
    })
    }
    async getAllKviz(req,res){
        const sql = (
            `select * from kviz;`
        )
        db.all(sql, (err,rows) => {
            if (err) return res.json(err)
            if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
            else res.json(rows)
    })
    }

    async completeKviz(req, res) {
        try {
            const { user_id, kviz_id } = req.body;
    
            // Проверяем, переданы ли все обязательные поля
            if (!user_id || !kviz_id) {
                return res.status(400).json({ error: 'Необходимо указать user_id и kviz_id' });
            }
    
            // Получаем данные квиза (включая reward)
            const getKvizSql = `
                SELECT reward FROM kviz WHERE id = ?
            `;
            db.get(getKvizSql, [kviz_id], (err, kviz) => {
                if (err) {
                    console.error('Ошибка при получении данных квиза:', err);
                    return res.status(500).json({ error: 'Ошибка сервера', details: err.message });
                }
    
                if (!kviz) {
                    return res.status(404).json({ error: 'Квиз не найден' });
                }
    
                const reward = kviz.reward;
    
                // Проверяем, завершал ли пользователь этот квиз ранее
                const checkCompletionSql = `
                    SELECT * FROM kviz_complit WHERE user_id = ? AND kviz_id = ?
                `;
                db.get(checkCompletionSql, [user_id, kviz_id], (err, completion) => {
                    if (err) {
                        console.error('Ошибка при проверке завершения квиза:', err);
                        return res.status(500).json({ error: 'Ошибка сервера', details: err.message });
                    }
    
                    if (completion) {
                        return res.status(400).json({ error: 'Пользователь уже завершил этот квиз' });
                    }
    
                    // Начисляем награду пользователю
                    const updatePointsSql = `
                        UPDATE users SET points = points + ? WHERE id = ?
                    `;
                    db.run(updatePointsSql, [reward, user_id], (err) => {
                        if (err) {
                            console.error('Ошибка при начислении награды:', err);
                            return res.status(500).json({ error: 'Ошибка сервера', details: err.message });
                        }
    
                        // Записываем информацию о завершении квиза
                        const insertCompletionSql = `
                            INSERT INTO kviz_complit (user_id, kviz_id, reward_id)
                            VALUES (?, ?, ?)
                        `;
                        db.run(insertCompletionSql, [user_id, kviz_id, reward], function (err) {
                            if (err) {
                                console.error('Ошибка при записи завершения квиза:', err);
                                return res.status(500).json({ error: 'Ошибка сервера', details: err.message });
                            }
    
                            return res.status(200).json({
                                message: 'Квиз успешно завершен',
                                reward: reward,
                                new_points: reward
                            });
                        });
                    });
                });
            });
        } catch (error) {
            console.error('Неожиданная ошибка:', error);
            return res.status(500).json({ error: 'Неожиданная ошибка сервера', details: error.message });
        }
    }

    async getSplashKviz(req, res) {
        try {
            const { id } = req.body;
    
            // Проверяем, передан ли ID
            if (!id) {
                return res.status(400).json({ error: 'Необходимо указать ID квиза' });
            }
    
            // SQL-запрос для получения данных квиза
            const sql = `
                SELECT name, reward, questions FROM kviz WHERE id = ?
            `;
    
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error('Ошибка при получении данных квиза:', err);
                    return res.status(500).json({ error: 'Ошибка сервера', details: err.message });
                }
    
                if (!row) {
                    return res.status(404).json({ error: 'Квиз не найден' });
                }
    
                // Преобразуем questions из JSON-строки в объект
                let questionsCount = 0;
                try {
                    const questions = JSON.parse(row.questions);
                    questionsCount = Array.isArray(questions) ? questions.length : 0;
                } catch (error) {
                    console.error('Ошибка при парсинге questions:', error);
                    return res.status(500).json({ error: 'Ошибка при обработке данных questions', details: error.message });
                }
    
                // Возвращаем результат
                return res.status(200).json({
                    name: row.name,
                    reward: row.reward,
                    questions_count: questionsCount
                });
            });
        } catch (error) {
            console.error('Неожиданная ошибка:', error);
            return res.status(500).json({ error: 'Неожиданная ошибка сервера', details: error.message });
        }
    }
    async getPageKviz(req,res){
        const{id} = req.body
        const sql = (
            `select name, questions from kviz where id= ?;`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
            else res.json(rows)
    })
    }

    async insertCompletedKviz(req, res) {
        try {
            const { user_id, kviz_id } = req.body;
    
            // Проверяем, что все обязательные поля переданы
            if (!user_id || !kviz_id) {
                return res.status(400).json({ error: "Необходимо указать user_id и kviz_id" });
            }
    
            // SQL-запрос для добавления завершенного квиза
            const sql = `
                INSERT INTO completed_kviz (user_id, kviz_id)
                VALUES (?, ?);
            `;
    
            // Выполняем запрос к базе данных
            db.run(sql, [user_id, kviz_id], function (err) {
                if (err) {
                    console.error("Ошибка при добавлении завершенного квиза:", err);
                    return res.status(500).json({ error: "Ошибка сервера", details: err.message });
                }
    
                // Проверяем, была ли запись успешно добавлена
                if (this.changes === 0) {
                    return res.status(500).json({ error: "Не удалось добавить завершенный квиз" });
                }
    
                // Возвращаем успешный ответ
                return res.status(200).json({
                    message: `Квиз с ID ${kviz_id} успешно добавлен в завершенные для пользователя с ID ${user_id}`
                });
            });
        } catch (error) {
            console.error("Неожиданная ошибка:", error);
            return res.status(500).json({ error: "Неожиданная ошибка сервера", details: error.message });
        }
    }
    async getCompletedKvizByUser(req, res) {
        try {
            const { user_id } = req.body;
    
            // Проверяем, передан ли user_id
            if (!user_id) {
                return res.status(400).json({ error: "Необходимо указать user_id" });
            }
    
            // SQL-запрос для получения завершенных квизов пользователя
            const sql = `
                SELECT k.*
                FROM kviz k
                JOIN completed_kviz ck ON k.id = ck.kviz_id
                WHERE ck.user_id = ?;
            `;
    
            // Выполняем запрос к базе данных
            db.all(sql, [user_id], (err, rows) => {
                if (err) {
                    console.error("Ошибка при получении завершенных квизов:", err);
                    return res.status(500).json({ error: "Ошибка сервера", details: err.message });
                }
    
                // Если нет завершенных квизов
                if (rows.length === 0) {
                    return res.status(404).json({ message: "У пользователя нет завершенных квизов" });
                }
    
                // Возвращаем список завершенных квизов
                return res.status(200).json({
                    message: "Завершенные квизы успешно получены",
                    kvizzes: rows
                });
            });
        } catch (error) {
            console.error("Неожиданная ошибка:", error);
            return res.status(500).json({ error: "Неожиданная ошибка сервера", details: error.message });
        }
    }


}

module.exports = new KvizController()
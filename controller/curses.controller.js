const db = require('../config')

class courseController{
    async createCourse(req, res) {
        try {
            const { name, description, topic_id, preview } = req.body;
    
            // Проверяем, переданы ли все обязательные поля
            if (!name || !description || !topic_id || !preview) {
                return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля: name, description, topic_id, preview' });
            }
    
            // Находим название темы по её ID
            const findTopicSql = `
                SELECT name AS topic_name FROM topics WHERE id = ?
            `;
            db.get(findTopicSql, [topic_id], (err, topic) => {
                if (err) {
                    console.error('Ошибка при поиске темы:', err);
                    return res.status(500).json({ error: 'Ошибка сервера', details: err.message });
                }
    
                if (!topic) {
                    return res.status(400).json({ error: `Тема с ID "${topic_id}" не найдена` });
                }
    
                const topic_name = topic.topic_name;
    
                // Создаем курс с указанным topic_id
                const insertSql = `
                    INSERT INTO curses (name, description, topic_id, preview)
                    VALUES (?, ?, ?, ?)
                `;
                db.run(insertSql, [name, description, topic_id, preview], function (err) {
                    if (err) {
                        console.error('Ошибка при создании курса:', err);
                        return res.status(500).json({ error: 'Ошибка сервера', details: err.message });
                    }
    
                    // Возвращаем результат с названием темы
                    return res.status(201).json({
                        message: 'Курс успешно создан',
                        course_id: this.lastID,
                        topic_name: topic_name
                    });
                });
            });
        } catch (error) {
            console.error('Неожиданная ошибка:', error);
            return res.status(500).json({ error: 'Неожиданная ошибка сервера', details: error.message });
        }
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

    async getAllCourse(req, res) {
    try {
        // SQL-запрос с JOIN для получения названия темы вместо topic_id
        const sql = `
            SELECT 
                curses.id AS course_id,
                curses.name AS course_name,
                curses.description AS course_description,
                topics.name AS topic_name,
                curses.preview AS course_preview
            FROM 
                curses
            LEFT JOIN 
                topics ON curses.topic_id = topics.id;
        `;

        db.all(sql, (err, rows) => {
            if (err) {
                console.error('Ошибка при получении курсов:', err);
                return res.status(500).json({ error: 'Ошибка сервера', details: err.message });
            }

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Курсы не найдены' });
            }

            // Возвращаем результат
            return res.status(200).json(rows);
        });
    } catch (error) {
        console.error('Неожиданная ошибка:', error);
        return res.status(500).json({ error: 'Неожиданная ошибка сервера', details: error.message });
    }
}

    async getCourse(req, res) {
        try {
            const { id } = req.body;
    
            // Проверяем, передан ли ID курса
            if (!id) {
                return res.status(400).json({ error: 'Необходимо указать ID курса' });
            }
    
            // SQL-запрос с JOIN для получения данных о курсе, теме и количестве страниц
            const sql = `
                SELECT 
                    curses.name AS course_name,
                    curses.description AS course_description,
                    topics.name AS topic_name,
                    COUNT(pages.id) AS page_count
                FROM 
                    curses
                LEFT JOIN 
                    topics ON curses.topic_id = topics.id
                LEFT JOIN 
                    pages ON curses.id = pages.course_id
                WHERE 
                    curses.id = ?
                GROUP BY 
                    curses.id;
            `;
    
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error('Ошибка при получении курса:', err);
                    return res.status(500).json({ error: 'Ошибка сервера', details: err.message });
                }
    
                if (!row) {
                    return res.status(404).json({ message: 'Курс не найден' });
                }
    
                // Возвращаем результат
                return res.status(200).json(row);
            });
        } catch (error) {
            console.error('Неожиданная ошибка:', error);
            return res.status(500).json({ error: 'Неожиданная ошибка сервера', details: error.message });
        }
    }
    async getCoursesByUserTopics(req, res) {
        try {
            const { user_id } = req.body;
    
            // Проверяем, передан ли user_id
            if (!user_id) {
                return res.status(400).json({ error: "Необходимо указать user_id" });
            }
    
            // Получаем проценты пользователя
            const getUserPercentagesSql = `
                SELECT percent_by_topic
                FROM users
                WHERE id = ?;
            `;
            db.get(getUserPercentagesSql, [user_id], async (err, row) => {
                if (err) {
                    console.error("Ошибка при получении процентов пользователя:", err);
                    return res.status(500).json({ error: "Ошибка сервера", details: err.message });
                }
    
                if (!row) {
                    return res.status(404).json({ message: "Пользователь не найден" });
                }
    
                // Преобразуем JSON-строку в объект JavaScript
                const percentByTopic = JSON.parse(row.percent_by_topic);
    
                // Формируем список тем, для которых пользователь имеет проценты > 0
                const topicsWithPercentages = Object.keys(percentByTopic).filter(
                    (topic) => percentByTopic[topic] > 0
                );
    
                // Получаем числовые ID тем из таблицы topics
                const getTopicIdsSql = `
                    SELECT id
                    FROM topics
                    WHERE name IN (${topicsWithPercentages.map(() => '?').join(', ')});
                `;
                db.all(getTopicIdsSql, topicsWithPercentages, (err, topicRows) => {
                    if (err) {
                        console.error("Ошибка при получении ID тем:", err);
                        return res.status(500).json({ error: "Ошибка сервера", details: err.message });
                    }
    
                    // Извлекаем массив числовых ID тем
                    const topicIds = topicRows.map((row) => row.id);
    
                    // Если нет подходящих тем
                    if (topicIds.length === 0) {
                        return res.status(404).json({ message: "Курсы по выбранным темам не найдены" });
                    }
    
                    // SQL-запрос для получения курсов по темам пользователя
                    const sql = `
                        SELECT c.*
                        FROM curses c
                        WHERE c.topic_id IN (${topicIds.map(() => '?').join(', ')});
                    `;
    
                    // Выполняем запрос к базе данных
                    db.all(sql, topicIds, (err, rows) => {
                        if (err) {
                            console.error("Ошибка при получении курсов по темам пользователя:", err);
                            return res.status(500).json({ error: "Ошибка сервера", details: err.message });
                        }
    
                        // Если нет курсов по темам пользователя
                        if (rows.length === 0) {
                            return res.status(404).json({ message: "Курсы по выбранным темам не найдены" });
                        }
    
                        // Возвращаем список курсов
                        return res.status(200).json({
                            message: "Курсы по выбранным темам успешно получены",
                            courses: rows
                        });
                    });
                });
            });
        } catch (error) {
            console.error("Неожиданная ошибка:", error);
            return res.status(500).json({ error: "Неожиданная ошибка сервера", details: error.message });
        }
    }
}

module.exports = new courseController()
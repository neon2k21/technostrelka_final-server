const db = require('../config')



class UserController{

    async createUser(req, res) {
        try {
            const { name, login, password, topic1_id, topic2_id, topic3_id, topic4_id } = req.body;
    
            // Проверка обязательных полей
            if (!name || !login || !password) {
                return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля: name, login, password' });
            }
    
                // Проверка существования тем в таблице topics
                const checkTopicsSql = `
                    SELECT id FROM topics WHERE id IN (?, ?, ?, ?)
                `;
                db.all(checkTopicsSql, [topic1_id, topic2_id, topic3_id, topic4_id], (err, topics) => {
                    if (err) {
                        console.error('Ошибка при проверке тем:', err);
                        return res.status(500).json({ error: 'Ошибка при проверке тем', details: err.message });
                    }
    
                    // Получаем массив существующих ID тем
                    const existingTopicIds = topics.map(topic => topic.id);
    
                    // Проверяем, что все указанные topicX_id существуют
                    const providedTopicIds = [topic1_id, topic2_id, topic3_id, topic4_id].filter(id => id !== null);
                    const invalidTopicIds = providedTopicIds.filter(id => !existingTopicIds.includes(id));
    
                    if (invalidTopicIds.length > 0) {
                        return res.status(400).json({
                            error: `Следующие ID тем не существуют: ${invalidTopicIds.join(', ')}`
                        });
                    }
    
                    // Вставка нового пользователя
                    const insertSql = `
                        INSERT INTO users (name, login, password, topic1_id, topic2_id, topic3_id, topic4_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `;
                    db.run(insertSql, [name, login, password, topic1_id, topic2_id, topic3_id, topic4_id], function (err) {
                        if (err) {
                            console.error('Ошибка при создании пользователя:', err);
                            return res.status(500).json({ error: 'Ошибка при создании пользователя', details: err.message });
                        }
    
                        // Успешный ответ
                        return res.status(201).json({
                            message: 'Пользователь успешно создан',
                            user_id: this.lastID
                        });
                    });
                });
        } catch (error) {
            console.error('Неожиданная ошибка:', error);
            return res.status(500).json({ error: 'Неожиданная ошибка сервера', details: error.message });
        }
    }
      

    async getUser(req,res){
        const { login, password} = req.body
        console.log(login, password)
        const sql = (
            `select * from users where (login=? AND password=?);`
        )
        console.log(login, password)
        db.all(sql,[login, password], (err,rows) => {
            if (err) return res.json(err)
            if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
            else res.json(rows)
    })
    }



    async deleteUser(req,res){
        const { id } = req.body
        const sql = (
            `delete from users where id =?;`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err.message)
            else res.json(rows)
         })
    } 
    
    async setUserNickname(req,res){
        const {name, id} =req.body
        const sql = (
            ` update users set name=? where id=?;`
        )

        db.all(sql,[name, id], (err,rows) => {
            if (err) return res.json(err)
            else res.json(rows)
        })
    }
    
    async calculatePercentByTopic(req, res) {
        try {
            // Получаем список всех пользователей
            const getUsersSql = `
                SELECT id, percent_by_topic FROM users;
            `;
            db.all(getUsersSql, [], (err, users) => {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при получении пользователей', details: err.message });
                }
    
                // Для каждого пользователя рассчитываем проценты по всем темам
                users.forEach(user => {
                    const userId = user.id;
    
                    // Получаем текущие проценты из базы данных
                    let existingPercents = {};
                    try {
                        if (user.percent_by_topic) {
                            existingPercents = JSON.parse(user.percent_by_topic);
                        }
                    } catch (error) {
                        console.error(`Ошибка при парсинге percent_by_topic для user_id=${userId}:`, error);
                    }
    
                    // Получаем все темы из таблицы topics
                    const getTopicsSql = `
                        SELECT id, name FROM topics;
                    `;
                    db.all(getTopicsSql, [], (err, topics) => {
                        if (err) {
                            console.error('Ошибка при получении тем:', err);
                            return;
                        }
    
                        // Инициализируем объект для хранения процентов
                        let percentsByTopic = { ...existingPercents };
    
                        // Для каждой темы рассчитываем проценты
                        topics.forEach(topic => {
                            const topicId = topic.id;
                            const topicName = topic.name;
    
                            // Подсчитываем количество лайков пользователя по данной теме
                            const countLikesSql = `
                                SELECT COUNT(*) as like_count 
                                FROM likes 
                                JOIN posts ON likes.posts_id = posts.id 
                                WHERE likes.user_id = ? AND posts.topic_id = ?;
                            `;
                            db.get(countLikesSql, [userId, topicId], (err, likeCountResult) => {
                                if (err) {
                                    console.error(`Ошибка при подсчете лайков для user_id=${userId}, topic_id=${topicId}:`, err);
                                    return;
                                }
    
                                // Получаем общее количество постов по данной теме
                                const countPostsSql = `
                                    SELECT COUNT(*) as post_count 
                                    FROM posts 
                                    WHERE topic_id = ?;
                                `;
                                db.get(countPostsSql, [topicId], (err, postCountResult) => {
                                    if (err) {
                                        console.error(`Ошибка при подсчете постов для topic_id=${topicId}:`, err);
                                        return;
                                    }
    
                                    // Рассчитываем процент
                                    const likeCount = likeCountResult.like_count || 0;
                                    const postCount = postCountResult.post_count || 1; // Избегаем деления на ноль
                                    const percent = ((likeCount / postCount) * 100).toFixed(2);
    
                                    // Добавляем процент для текущей темы
                                    percentsByTopic[topicName] = parseFloat(percent);
    
                                    // Если все темы обработаны, обновляем запись в базе данных
                                    if (Object.keys(percentsByTopic).length === topics.length) {
                                        const updatePercentSql = `
                                            UPDATE users 
                                            SET percent_by_topic = ? 
                                            WHERE id = ?;
                                        `;
                                        db.run(updatePercentSql, [JSON.stringify(percentsByTopic), userId], function (err) {
                                            if (err) {
                                                console.error(`Ошибка при обновлении процента для user_id=${userId}:`, err);
                                                return;
                                            }
                                        });
                                    }
                                });
                            });
                        });
                    });
                });
    
                // Возвращаем успешный ответ
                return res.status(200).json({ message: 'Проценты успешно рассчитаны и обновлены' });
            });
        } catch (error) {
            console.error('Неожиданная ошибка:', error);
            return res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
        }
    }
    async updatePercentFromBot(req, res) {
        try {
            const { user_id, percentages } = req.body;
    
            // Проверяем, переданы ли все обязательные поля
            if (!user_id || !percentages) {
                return res.status(400).json({ error: 'Необходимо указать user_id и percentages' });
            }
    
            // Преобразуем проценты в JSON-строку
            const percentagesJson = JSON.stringify(percentages);
    
            // Обновляем поле percent_by_topic для пользователя
            const updateSql = `
                UPDATE users 
                SET percent_by_topic = ? 
                WHERE id = ?;
            `;
            db.run(updateSql, [percentagesJson, user_id], function (err) {
                if (err) {
                    console.error('Ошибка при обновлении процентов от бота:', err);
                    return res.status(500).json({ error: 'Ошибка сервера', details: err.message });
                }
    
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Пользователь не найден' });
                }
    
                return res.status(200).json({
                    message: 'Проценты успешно обновлены',
                    user_id: user_id,
                    percentages: percentages
                });
            });
        } catch (error) {
            console.error('Неожиданная ошибка:', error);
            return res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
        }
    }
    async getAllUserforlist(req, res) {
        try {
            // SQL-запрос для получения первых пяти пользователей с наивысшими очками
            const sql = `
                SELECT name, points 
                FROM users
                ORDER BY points DESC
                LIMIT 5;
            `;
    
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('Ошибка при получении пользователей:', err);
                    return res.status(500).json({ error: 'Ошибка сервера', details: err.message });
                }
    
                if (rows.length === 0) {
                    return res.status(404).json({ error: 'Пользователи не найдены' });
                }
    
                // Возвращаем список из первых пяти пользователей
                return res.status(200).json(rows);
            });
        } catch (error) {
            console.error('Неожиданная ошибка:', error);
            return res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
        }
    }
        async getPercent(req,res){
            const {id} = req.body
        
            console.log(id)
            const sql = (
                `select percent_by_topic from users where id=?;`
            )
            db.all(sql,[id], (err,rows) => {
                if (err) return res.json(err)
                if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
                else res.json(rows)
        })
        }
//Profily
        async getInfobyProfily(req,res){
            const {id} = req.body
        
            console.log(id)
            const sql = (
                `select name, points, topic1_id, topic2_id, topic3_id, topic4_id from users where id=?;`
            )
            db.all(sql,[id], (err,rows) => {
                if (err) return res.json(err)
                if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
                else res.json(rows)
        })
        }
        async insertCompletedCourse(req,res){
            const {user_id,course_id} = req.body
    
            const sql = (
                `INSERT INTO completed_course (user_id,course_id)
                        VALUES (?, ?)`
            )
            db.all(sql,[user_id,course_id], (err,rows) => {
                if (err) return res.json(err.message)
                if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
                else res.json(rows)
        })
        }

        async getCompletedCursebyUser(req, res) {
            try {
                const { user_id } = req.body;
        
                // Проверяем, передан ли user_id
                if (!user_id) {
                    return res.status(400).json({ error: "Необходимо указать user_id" });
                }
        
                // SQL-запрос для получения завершенных курсов пользователя
                const sql = `
                    SELECT c.*
                    FROM curses c
                    JOIN completed_course cc ON c.id = cc.course_id
                    WHERE cc.user_id = ?;
                `;
        
                // Выполняем запрос к базе данных
                db.all(sql, [user_id], (err, rows) => {
                    if (err) {
                        console.error("Ошибка при получении завершенных курсов:", err);
                        return res.status(500).json({ error: "Ошибка сервера", details: err.message });
                    }
        
                    // Если нет завершенных курсов
                    if (rows.length === 0) {
                        return res.status(404).json({ message: "У пользователя нет завершенных курсов" });
                    }
        
                    // Возвращаем список завершенных курсов
                    return res.status(200).json({
                        message: "Завершенные курсы успешно получены",
                        courses: rows
                    });
                });
            } catch (error) {
                console.error("Неожиданная ошибка:", error);
                return res.status(500).json({ error: "Неожиданная ошибка сервера", details: error.message });
            }
        }

        async addCourseToProcess(req, res) {
            try {
                const { user_id, course_id } = req.body; // Получаем user_id и course_id из тела запроса
        
                // Проверяем, что все обязательные поля переданы
                if (!user_id || !course_id) {
                    return res.status(400).json({ error: "Необходимо указать user_id и course_id" });
                }
        
                // Проверка, существует ли уже запись для этого пользователя и курса
                const checkSql = `
                    SELECT id
                    FROM process_course
                    WHERE user_id = ? AND course_id = ?;
                `;
                db.get(checkSql, [user_id, course_id], (err, row) => {
                    if (err) {
                        console.error("Ошибка при проверке существования курса:", err);
                        return res.status(500).json({ error: "Ошибка сервера", details: err.message });
                    }
        
                    // Если запись уже существует, возвращаем ошибку
                    if (row) {
                        return res.status(409).json({ error: "Курс уже добавлен в процесс изучения" });
                    }
        
                    // SQL-запрос для добавления курса в процесс изучения
                    const insertSql = `
                        INSERT INTO process_course (user_id, course_id, progress)
                        VALUES (?, ?, 0);
                    `;
        
                    // Выполняем запрос к базе данных
                    db.run(insertSql, [user_id, course_id], function (err) {
                        if (err) {
                            console.error("Ошибка при добавлении курса в процесс изучения:", err);
                            return res.status(500).json({ error: "Ошибка сервера", details: err.message });
                        }
        
                        // Возвращаем успешный ответ
                        return res.status(200).json({
                            message: `Курс с ID ${course_id} успешно добавлен в процесс изучения для пользователя с ID ${user_id}`
                        });
                    });
                });
            } catch (error) {
                console.error("Неожиданная ошибка:", error);
                return res.status(500).json({ error: "Неожиданная ошибка сервера", details: error.message });
            }
        }
        async updateCourseProgress(userId, courseId, progress) {
            try {
                const updateSql = `
                    UPDATE process_course
                    SET progress = ?
                    WHERE user_id = ? AND course_id = ?;
                `;
                await db.run(updateSql, [progress, userId, courseId]);
                console.log(`Прогресс курса с ID ${courseId} для пользователя с ID ${userId} обновлен до ${progress}%`);
            } catch (error) {
                console.error('Ошибка при обновлении прогресса курса:', error);
                throw error;
            }
        }
        async updateCourseProgress(userId, courseId, progress) {
            try {
                const updateSql = `
                    UPDATE process_course
                    SET progress = ?
                    WHERE user_id = ? AND course_id = ?;
                `;
                await db.run(updateSql, [progress, userId, courseId]);
                console.log(`Прогресс курса с ID ${courseId} для пользователя с ID ${userId} обновлен до ${progress}%`);
            } catch (error) {
                console.error('Ошибка при обновлении прогресса курса:', error);
                throw error;
            }
        }
        async getProcessCoursesByUser(req, res) {
            try {
                const { user_id } = req.body; // Получаем user_id из тела запроса
        
                // Проверяем, что user_id передан
                if (!user_id) {
                    return res.status(400).json({ error: "Необходимо указать user_id" });
                }
        
                // SQL-запрос для получения текущих курсов пользователя
                const query = `
                    SELECT c.*, pc.progress
                    FROM curses c
                    JOIN process_course pc ON c.id = pc.course_id
                    WHERE pc.user_id = ?;
                `;
        
                // Выполняем запрос к базе данных
                db.all(query, [user_id], (err, rows) => {
                    if (err) {
                        console.error("Ошибка при получении текущих курсов:", err);
                        return res.status(500).json({ error: "Ошибка сервера", details: err.message });
                    }
        
                    // Если нет текущих курсов
                    if (rows.length === 0) {
                        return res.status(404).json({ message: "У пользователя нет текущих курсов" });
                    }
        
                    // Возвращаем список текущих курсов
                    return res.status(200).json({
                        message: "Текущие курсы успешно получены",
                        courses: rows
                    });
                });
            } catch (error) {
                console.error("Неожиданная ошибка:", error);
                return res.status(500).json({ error: "Неожиданная ошибка сервера", details: error.message });
            }
        }
        async completeCourse(req, res) {
            try {
                const { user_id, course_id } = req.body; // Получаем данные из тела запроса
        
                // Проверяем, что все обязательные поля переданы
                if (!user_id || !course_id) {
                    return res.status(400).json({ error: "Необходимо указать user_id и course_id" });
                }
        
                // Перемещаем курс в таблицу completed_course
                const insertSql = `
                    INSERT INTO completed_course (user_id, course_id)
                    VALUES (?, ?);
                `;
                await db.run(insertSql, [user_id, course_id]);
        
                // Удаляем курс из таблицы process_course
                const deleteSql = `
                    DELETE FROM process_course
                    WHERE user_id = ? AND course_id = ?;
                `;
                const deleteResult = await new Promise((resolve, reject) => {
                    db.run(deleteSql, [user_id, course_id], function (err) {
                        if (err) {
                            console.error("Ошибка при удалении курса из process_course:", err);
                            return reject(err);
                        }
                        resolve(this.changes); // Количество затронутых строк
                    });
                });
        
                // Если курс не был найден в process_course
                if (deleteResult === 0) {
                    return res.status(404).json({ error: "Курс с указанными user_id и course_id не найден в process_course" });
                }
        
                // Возвращаем успешный ответ
                return res.status(200).json({
                    message: `Курс с ID ${course_id} успешно завершен и перемещен в completed_course`
                });
            } catch (error) {
                console.error("Неожиданная ошибка:", error);
                return res.status(500).json({ error: "Неожиданная ошибка сервера", details: error.message });
            }
        }
    }

module.exports = new UserController()
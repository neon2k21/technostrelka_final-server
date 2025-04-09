const db = require('../config')



class UserController{

    async createUser(req, res) {
        try {
            const { name, login, password, topic1_id, topic2_id, topic3_id, topic4_id } = req.body;
    
            // Проверка обязательных полей
            if (!name || !login || !password) {
                return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля: name, login, password' });
            }
    
            // Проверка уникальности логина и имени
            const checkUserSql = `
                SELECT * FROM users WHERE name = ? OR login = ?
            `;
            db.all(checkUserSql, [name, login], (err, rows) => {
                if (err) {
                    console.error('Ошибка при проверке пользователя:', err);
                    return res.status(500).json({ error: 'Ошибка при проверке пользователя', details: err.message });
                }
    
                if (rows.length > 0) {
                    return res.status(400).json({ error: 'Такой логин или имя уже используются' });
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
            `delete * from users where id =?;`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
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
                SELECT id FROM users;
            `;
            db.all(getUsersSql, [], (err, users) => {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при получении пользователей', details: err.message });
                }
    
                // Для каждого пользователя рассчитываем проценты по всем темам
                users.forEach(user => {
                    const userId = user.id;
    
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
                        let percentsByTopic = {};
    
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
    
                                    // Добавляем процент для текущей темы с использованием имени темы
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
        async getAllUserforlist(req,res){
            const { name,points} = req.body
            const sql = (
                `select name,points from users;`
            )
            db.all(sql,[name,points], (err,rows) => {
                if (err) return res.json(err)
                if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
                else res.json(rows)
        })
        }
    }

module.exports = new UserController()
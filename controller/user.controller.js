const db = require('../config')



class UserController{

    async createUser(req, res) {
        const { nickname, login, password, topic_id } = req.body;
    
        const checkSql = `
            SELECT * FROM users WHERE nickname = ? OR login = ?
        `;
    
        db.all(checkSql, [nickname, login], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при проверке пользователя', details: err });
            }
    
            if (rows.length > 0) {
                return res.status(400).json({ error: 'Такой логин или ник уже используется' });
            }
    
            const insertSql = `
                INSERT INTO users (nickname, login, password, topic_id)
                VALUES (?, ?, ?, ?)
            `;
    
            db.run(insertSql, [nickname, login, password, topic_id], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при создании пользователя', details: err });
                }
    
                return res.status(201).json({
                    message: 'Пользователь успешно создан',
                    user_id: this.lastID
                });
            });
        });
    }
      

    async getUser(req,res){
        const { login, password} = req.body
        console.log(login, password)
        const sql = (
            `select * from users where (login=? AND password=?);`
        )
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
                    SELECT id, topic_id FROM users;
                `;
                db.all(getUsersSql, [], (err, users) => {
                    if (err) {
                        return res.status(500).json({ error: 'Ошибка при получении пользователей', details: err });
                    }
    
                    // Для каждого пользователя рассчитываем проценты
                    users.forEach(user => {
                        const userId = user.id;
                        const topicId = user.topic_id;
    
                        // Подсчитываем количество лайков пользователя по данной теме
                        const countLikesSql = `
                            SELECT COUNT(*) as like_count 
                            FROM likes 
                            JOIN posts ON likes.posts_id = posts.id 
                            WHERE likes.user_id = ? AND posts.topic_id = ?;
                        `;
                        db.get(countLikesSql, [userId, topicId], (err, likeCountResult) => {
                            if (err) {
                                console.error('Ошибка при подсчете лайков:', err);
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
                                    console.error('Ошибка при подсчете постов:', err);
                                    return;
                                }
    
                                // Рассчитываем процент
                                const likeCount = likeCountResult.like_count || 0;
                                const postCount = postCountResult.post_count || 1; // Избегаем деления на ноль
                                const percent = (likeCount / postCount) * 100;
    
                                // Обновляем поле percent_by_topic в таблице users
                                const updatePercentSql = `
                                    UPDATE users 
                                    SET percent_by_topic = ? 
                                    WHERE id = ?;
                                `;
                                db.run(updatePercentSql, [percent, userId], function (err) {
                                    if (err) {
                                        console.error('Ошибка при обновлении процента:', err);
                                        return;
                                    }
                                });
                            });
                        });
                    });
    
                    // Возвращаем успешный ответ
                    return res.status(200).json({ message: 'Проценты успешно рассчитаны и обновлены' });
                });
            } catch (error) {
                return res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error });
            }
        }
    }

module.exports = new UserController()
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
}



module.exports = new UserController()
const db = require('../config')



class UserController{

    async createUser(req,res){
        
        const { nickname, login, pass } = req.body
        const sql = (
            `insert into users (nickname, login, pass, token, role) values (?, ?, ?,"",1);`
        )
        db.all(sql,[nickname, login, pass], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)     
        })
        
    }   

    async getUser(req,res){
        const { login, password} = req.body
        console.log(login, password)
        const sql = (
            `select * from users where (login=? AND pass=?);`
        )
        db.all(sql,[login, password], (err,rows) => {
            if (err) return res.json(err)
            if(rows.length === 0) return res.json('Данные не совпадают! Проверьте и повторите попытку')
            else res.json(rows)
    })
    }

    async getUserNickName(req,res){
        const { id } = req.body
       
        const sql = (
            `select * from users where id=?;`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            else res.json(rows)
    })
    }



    async deleteUser(req,res){
        const { id } = req.body
        const sql = (
            `delete from users where id =?;`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            else res.json(rows)
         })
    }    

    async setUserToken(req,res){
        const {user, token} =req.body
        const sql = (
            ` update users set token=? where id=?;`
        )

        db.all(sql,[token, user], (err,rows) => {
            if (err) return res.json(err)
            else res.json(rows)
        })
    }

    async getFavouriteObject(req,res){
        const {id} = req.body


        const sql = (
            ` SELECT o.*
            FROM objects o
            INNER JOIN users_favourite_objects ufo ON o.id = ufo.object_id
            WHERE ufo.user = ?;`
        )

        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            else res.json(rows)
        })

        
       
    }

    async getLikedPubs(req,res){
        
        const {id} = req.body


        const sql = (
            ` SELECT p.*
            FROM publications p
            INNER JOIN Likes l ON p.id = l.publication_id
            WHERE l.useradd = ?;`
        )

        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            else res.json(rows)
        })

}


    async setUserAvatar(req,res){
        const {id,avatar} =req.body
        const sql = (
            ` update users set avatar=? where id=?;`
        )

        db.all(sql,[avatar, id], (err,rows) => {
            if (err) return res.json(err)
            else res.json(rows)
        })
    }

    
}



module.exports = new UserController()
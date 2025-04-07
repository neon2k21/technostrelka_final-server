const db = require('../config')
const { format } = require('date-fns');


class ObjectController{

    async createObject(req,res){
      
        const { longitute, altitude, category, address, image, name, phone, website, monday,tuesday,wednesday,thursday,friday, saturday,sunday } = req.body
        const sql = (
            `insert into objects ( longitute, altitude, category, address, image, name, phone, website, monday,tuesday,wednesday,thursday,friday, saturday,sunday) values ( $1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11,$12,$13,$14,$15);`
        )
        db.all(sql,[longitute, altitude, category,  address, image, name, phone, website, monday,tuesday,wednesday,thursday,friday, saturday,sunday], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
    })
    } 
    
    // async updateObject(req,res){
    //     const { longitute, altitude, category, working_time, address, image, name, phone, website, id } = req.body
    //     const sql = (
    //         `update objects set longitute = ?, altitude = ?, category = ?, working_time = ?, address = ?, image = ?, name = ?, phone = ?, website = ? where id = ?;`
    //     )
    //     db.all(sql,[longitute, altitude, category, working_time, address, image, name, phone, website, id], (err,rows) => {
    //         if (err) return res.json(err)
    //         else return res.json(rows)
    // })
        
    // }

    async updateObject(req,res){
        const {  phone, id } = req.body
        const sql = (
            `update objects set  phone = ? where id = ?;`
        )
        db.all(sql,[ phone, id], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
    })
        
    }

    async addObjectToFavourite(req,res){
        const { object, user } = req.body
        const sql = (
            `insert into users_favourite_objects ( object_id, user ) values ( ?, ?);`
        )
        db.all(sql,[object, user], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
    })
    }

    async deleteObjectToFavourite(req,res){
        const { object, user } = req.body
        const sql = (
            `delete from  users_favourite_objects where object_id=? and user=?;`
        )
        db.all(sql,[object, user], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
    })
    }


    async deleteObject(req,res){
        const { id } = req.body
        const sql = (
            `delete from objects where id = ${id};`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
    })
        
    }
  
   async getAllObjects(req,res){

        const sql = 
        `SELECT * from objects`
       
        await db.all(sql,[], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
       })

    }

    async getAllCategories(req,res){
        const sql = `select * from object_category`
       
        await db.all(sql,[], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
       })
    }


    async getAllObjectsByCategory(req,res){
        const {category} = req.body
         const sql = `SELECT * from objects where category=?`
       
        await db.all(sql,[category], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
       })

    }

    async getCurrentObject(req,res){

        const {id} = req.body
        updateMark(db)
        const sql = 
            `SELECT * from objects WHERE  id= ?;`

        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
       })
       
    }



    async createReview(req,res){

        const today = new Date();
        const formattedToday = format(today, 'yyyy-MM-dd');
      
        const {  user, object, comment, mark, image1, image2, image3 } = req.body
        const sql = (
            `insert into Review ( user, object, comment, mark, image1, image2, image3, data ) values (?, ?, ?, ?, ?, ?, ?, ?);`
        )
        db.all(sql,[user, object, comment, mark, image1, image2, image3, formattedToday], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
    })
    updateMark(db)
    } 


    async getAllReviewsForCurrentObject(req,res){
        updateMark(db)
        const {id} = req.body
        const sql = (
            `select * from Review where object=?;`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
    })
    } 


    async getAllReviews(req,res){
        updateMark(db)
        const sql = (
            `select * from Review;`
        )
        db.all(sql,[], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
    })
    } 
    
    async applyReview(req,res){
        const { id } = req.body
        const sql = (
            `update Review set checked = 1 where id = ?;`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
    })
        
    }

    async deleteReview(req,res){
        const { id } = req.body
        const sql = (
            `delete from Review where id = ?;`
        )
        db.all(sql,[id], (err,rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
    })
    updateMark(db)        
    }



}

async function getDataAllObjects(db){
    return new Promise((resolve, reject) => {
        var responseObj;
        db.all(`select * from objects;`,(err, rows) => {
            if (err) {
                responseObj = {
                  'error': err
                };
                reject(responseObj);
              } else {
                responseObj = {
                  rows: rows
                };
                resolve(responseObj);
            }
        });
    });
}



async function updateMark(db) {
    const all_objects = await getDataAllObjects(db)

    const total_marks = await getcountmarks(db)
   
    for(let j = 0; j < all_objects.rows.length; j++){
        var count = 0;
        let marks_sum = 0
        for(let i = 0; i < total_marks.rows.length; i++ ){
            if(total_marks.rows[i].object === all_objects.rows[j].id) {
                count++;
                marks_sum += Number(total_marks.rows[i].mark)
            }
        }
        const reate = marks_sum/count

        await db.all(`update objects set rating=? where id=?;`, [reate, all_objects.rows[j].id])
    }
    
   


}

async function getcountmarks(db) {
    return new Promise((resolve, reject) => {
        var responseObj;
        db.all(`select * from Review;`,(err, rows) => {
            if (err) {
                responseObj = {
                  'error': err
                };
                reject(responseObj);
              } else {
                responseObj = {
                  rows: rows
                };
                resolve(responseObj);
            }
        });
    });
}


module.exports = new ObjectController()
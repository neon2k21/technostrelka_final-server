const db = require('../config')
const { format } = require('date-fns');
const { getMessaging } = require("firebase-admin/messaging")


class PublicationController {

    async createPublication(req, res) {


        const { useradd, name, points_names, review, image1, image2,
            image3, startpoint, endpoint, waypoint1, waypoint2, waypoint3, waypoint4, waypoint5,
            waypoint6, waypoint7, waypoint8, object_id_startPoint, object_id_EndPoint, object_id_waypoint1, object_id_waypoint2,
            object_id_waypoint3, object_id_waypoint4, object_id_waypoint5, object_id_waypoint6, object_id_waypoint7,
            object_id_waypoint8, tag_1, tag_2, tag_3, tag_4, tag_5, tag_6, tag_7 } = req.body
        const sql = (
            `insert into publications (useradd, name, points_names, review,  image1, image2,
                image3, startpoint, endpoint, waypoint1, waypoint2, waypoint3, waypoint4, waypoint5,
                waypoint6, waypoint7, waypoint8, object_id_startPoint, object_id_EndPoint, object_id_waypoint1, object_id_waypoint2,
                object_id_waypoint3, object_id_waypoint4, object_id_waypoint5, object_id_waypoint6, object_id_waypoint7,		
                object_id_waypoint8, tag_1, tag_2, tag_3, tag_4, tag_5, tag_6, tag_7) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?);`
        )
        db.all(sql, [useradd, name, points_names, review, image1, image2,
            image3, startpoint, endpoint, waypoint1, waypoint2, waypoint3, waypoint4, waypoint5,
            waypoint6, waypoint7, waypoint8, object_id_startPoint, object_id_EndPoint, object_id_waypoint1, object_id_waypoint2,
            object_id_waypoint3, object_id_waypoint4, object_id_waypoint5, object_id_waypoint6, object_id_waypoint7,
            object_id_waypoint8, tag_1, tag_2, tag_3, tag_4, tag_5, tag_6, tag_7], (err, rows) => {
                if (err) return res.json(err)
                else return res.json(rows)
            })

    }

    async getAllPublications(req, res) {
        countLikesAndLikes(db)
        const sql = (
            `select * from publications`
        )
        db.all(sql, [], (err, rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
        })


    }

    async getCurrentPub(req, res) {
        countLikesAndLikes(db)
        const { id } = req.body
        const sql = (
            `select * from publications where id=?`
        )
        db.all(sql, [id], (err, rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
        })
    }

    async getAllUserPublications(req, res) {
        const { id } = req.body
        countLikesAndLikes(db)
        const sql = (
            `select * from publications where useradd=? `
        )
        db.all(sql, [id], (err, rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
        })
    }

    async getAllFilters(req, res) {
        const sql = (
            `select * from publications_tags`
        )
        db.all(sql, [], (err, rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
        })
    }

    async getallpublicationbyfilter(req, res) {
        const { tag_1, tag_2, tag_3, tag_4, tag_5, tag_6, tag_7 } = req.body
        if (tag_1 != 0) {
            const sql = (
                `select * from publications where tag_1 !=0;`
            )
            db.all(sql, [], (err, rows) => {
                if (err) return res.json(err)
                else res.json(rows)
            })
            return
        }
        if (tag_2 != 0) {
            const sql = (
                `select * from publications where tag_2 !=0;`
            )
            db.all(sql, [], (err, rows) => {
                if (err) return res.json(err)
                else res.json(rows)
            })
            return
        }
        if (tag_3 != 0) {
            const sql = (
                `select * from publications where tag_3 !=0;`
            )
            db.all(sql, [], (err, rows) => {
                if (err) return res.json(err)
                else res.json(rows)
            })
            return
        }
        if (tag_4 != 0) {
            const sql = (
                `select * from publications where tag_4 !=0;`
            )
            db.all(sql, [], (err, rows) => {
                if (err) return res.json(err)
                else res.json(rows)
            })
            return
        }
        if (tag_5 != 0) {
            const sql = (
                `select * from publications where tag_5 !=0;`
            )
            db.all(sql, [], (err, rows) => {
                if (err) return res.json(err)
                else res.json(rows)
            })
            return
        }
        if (tag_6 != 0) {
            const sql = (
                `select * from publications where tag_6 !=0;`
            )
            db.all(sql, [], (err, rows) => {
                if (err) return res.json(err)
                else res.json(rows)
            })
            return
        }
        if (tag_7 != 0) {
            const sql = (
                `select * from publications where tag_7 !=0;`
            )
            db.all(sql, [], (err, rows) => {
                if (err) return res.json(err)
                else res.json(rows)
            })
            return
        }



    }

    async approvepublication(req, res) {
        const { id } = req.body
        const sql = (
            `update publications set checked=1 where id =?;`
        )
        db.all(sql, [id], (err, rows) => {
            if (err) return res.json(err)
            else res.json(rows)
        })
    }

    async deletepublication(req, res) {
        const { id } = req.body
        const sql = (
            `delete from publications where id =?;`
        )
        db.all(sql, [id], (err, rows) => {
            if (err) return res.json(err)
            else res.json(rows)
        })

        const likes = await getInfoforDeleteLikes(db)

        for (let i = 0; i < likes.rows.length; i++) {
            await db.all(`delete from Likes where publication_id = ?;`, [id])
        }

        const comments = await getInfoforDeleteComments(db)

        for (let i = 0; i < comments.rows.length; i++) {
            await db.all(`delete from Comments where publication_id = ?;`, [id])
        }

    }


    async putlikepublication(req, res) {
        const { useradd, publication_id } = req.body
        const sql = (
            `insert into likes (useradd, publication_id) values (?, ?);`
        )
        db.all(sql, [useradd, publication_id], (err, rows) => {
            if (err) return res.json(err)
            else res.json(rows)
        })
        countLikesAndLikes(db)
        sendNotifeIfLike(publication_id)
    }

    async writecommentpublication(req, res) {
        const today = new Date();
        const formattedToday = format(today, 'yyyy-MM-dd');

        const { useradd, text, publication_id } = req.body
        const sql = (
            `insert into Comments (useradd, text, data, publication_id) values (?, ?, ?, ?);`
        )
        db.all(sql, [useradd, text, formattedToday, publication_id], (err, rows) => {
            if (err) return res.json(err)
            else res.json(rows)
        })
        countLikesAndLikes(db)
        sendNotifeIfComment(publication_id)
    }

    async deletelikepublication(req, res) {
        const { id, publication_id, useradd } = req.body
        const sql = (
            `delete from Likes where id = ? AND publication_id =? AND useradd=?;`
        )
        db.all(sql, [id, publication_id, useradd], (err, rows) => {
            if (err) return res.json(err)
            else res.json(rows)
        })

    }

    async deletecommentpublication(req, res) {
        const { id, publication_id, useradd } = req.body
        const sql = (
            `delete from Comments where id = ? AND publication_id =? AND useradd=?;`
        )
        db.all(sql, [id, publication_id, useradd], (err, rows) => {
            if (err) return res.json(err)
            else res.json(rows)
        })

    }

    async getcommentsbypub(req, res) {
        const { id } = req.body
        const sql = (
            `select * from Comments where publication_id=? `
        )
        db.all(sql, [id], (err, rows) => {
            if (err) return res.json(err)
            else return res.json(rows)
        })

    }

}


async function getInfoforDeleteLikes(db) {

    return new Promise((resolve, reject) => {
        var responseObj;
        db.all(`select * from Likes;`, (err, rows) => {
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


async function getInfoforDeleteComments(db) {

    return new Promise((resolve, reject) => {
        var responseObj;
        db.all(`select * from Comments;`, (err, rows) => {
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


async function getInfoForlikesAndComment(db) {

    return new Promise((resolve, reject) => {
        var responseObj;
        db.all(`select * from publications;`, (err, rows) => {
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


async function countLikesAndLikes(db) {
    const newObject = await getInfoForlikesAndComment(db)
    for (let i = 0; i < newObject.rows.length; i++) {
        const obj_likes = await countLikesForCurrentPublication(newObject.rows[i].id)
        const obj_comments = await countCommentsForCurrentPublication(newObject.rows[i].id)
        await db.all(`update publications set likes_count = ? where id = ?;`, [obj_likes.count, newObject.rows[i].id])
        await db.all(`update publications set comments_count = ? where id = ?;`, [obj_comments.count, newObject.rows[i].id])

    }

}

async function countLikesForCurrentPublication(id) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT COUNT(*) as count FROM Likes WHERE publication_id = ?;`, [id], (err, row) => {
                if (err) reject(err); // I assume this is how an error is thrown with your db callback
                resolve(row);
            });
    });


}

async function countCommentsForCurrentPublication(id) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT COUNT(*) as count FROM Comments WHERE publication_id = ?;`, [id], (err, row) => {
                if (err) reject(err); // I assume this is how an error is thrown with your db callback
                resolve(row);
            });
    });
}

async function getPubOwnerToken(pub_id) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT users.token
            FROM users
            JOIN publications ON users.id = publications.useradd
            WHERE publications.id = ?;`, [pub_id], (err, row) => {
            if (err) reject(err); // I assume this is how an error is thrown with your db callback
            resolve(row);
        });
    });
}

async function sendNotifeIfLike(pub_id) {
    const receiveToken = await getPubOwnerToken(pub_id)
    const message = {
        notification: {
            title: "Ваша публикация понравилась",
            body: "Только что вашу публикацию оценили!",
        },
        token: receiveToken.token
    }
    getMessaging().send(message)

}

async function sendNotifeIfComment(pub_id) {
    const receiveToken = await getPubOwnerToken(pub_id)
    const message = {
        notification: {
            title: "Новый комментарий",
            body: "Только что кто-то оставил новый комментарий!",
        },
        token: receiveToken.token
    }
    getMessaging().send(message)

}



module.exports = new PublicationController()
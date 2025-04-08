const express = require('express')
const userRouter = require('./routes/user.routes')
const topicRouter = require('./routes/topic.routes')
const postRouter = require('./routes/post.routes')
const pageRouter = require('./routes/page.routes')
const kvizRouter = require('./routes/kviz.routes')
const courseRouter = require('./routes/course.routes')
const likeRouter = require('./routes/like.routes')

const bodyParser = require('body-parser');

const PORT = process.env.PORT || 8080

const app = express()

app.use(bodyParser.json({limit: '500mb'}))
app.use('/api', userRouter)
app.use('/api', topicRouter)
app.use('/api', postRouter)
app.use('/api', pageRouter)
app.use('/api', kvizRouter)
app.use('/api', courseRouter)
app.use('/api', likeRouter)

app.listen(PORT, () => console.log(`Сервер запущен с портом: ${PORT}`))



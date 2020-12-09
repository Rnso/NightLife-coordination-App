import config from './config'
import express from 'express'
import router from './api'
import path from 'path'
import bodyParser from 'body-parser'
/*import cors from 'cors'

const server = express()

server.use(cors({
    origin: [
        'http://localhost:8080'
    ],
    credentials: true 
}))*/

server.use(bodyParser.json() )
server.use('/api', router)
server.use(express.static('dist'))


server.listen(config.port, () => {
    console.info('Express Listening on port:', config.port)
})

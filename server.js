import config from './config'
import express from 'express'
import router from './api'
import path from 'path'
import bodyParser from 'body-parser'


const server = express()

server.use(bodyParser.json() )
server.use('/api', router)
server.use(express.static('dist'))


server.listen(config.port, () => {
    console.info('Express Listening on port:', config.port)
})

import express from 'express'
import moment from 'moment'
import config from '../config'

const MongoClient = require('mongodb').MongoClient
const client = new MongoClient(config.mongodbUri, { useNewUrlParser: true })
let database
let collection
client.connect((err, client) => {
    if (err) console.log('failed to connect')
    else {
        console.log('connected')
        database = client.db('FCC')
        collection = database.collection('hangouts')
    }
})

const router = express.Router()

router.get('/getallhangouts', (req, res) => {
    let date = moment().format('L')
    collection.find({createdDate: date }).toArray((err, data) => {
        res.send(data)
    })

})

router.get('/getallcheckin/:id', (req, res) => {
    let date = moment().format('L')
    collection.find({ id: req.params.id, createdDate: date }).toArray((err, data) => {
        res.send(data)
    })

})

router.post('/checkin', (req, res) => {
    let date = moment().format('L')
    let obj = {}
    obj.user = req.body.user
    obj.id = req.body.id
    obj.createdDate = date
    collection.findOne({ user: req.body.user, id: req.body.id }).then(result1 => {
        if (result1) {
            collection.updateOne({ user: req.body.user, id: req.body.id }, { $set: { createdDate: date } }).then(result2 => {
                collection.find({ id: req.body.id, createdDate: date }).toArray((err, total) => {
                    res.send(total)
                })
            })
        }
        else {
            collection.insertOne(obj).then(result3 => {
                collection.find({ id: req.body.id, createdDate: date }).toArray((err, data) => {
                    res.send(data)
                })
            })
        }

    })

})

router.post('/checkout', (req, res) => {
    let date = moment().format('L')
    console.log(req.body.id)
    collection.deleteOne({ user: req.body.user, id: req.body.id }).then(result => {
        //console.log(result)
        collection.find({ id: req.body.id, createdDate: date }).toArray((err, data) => {
            res.send(data)
            console.log(data)
        })
    })

})


export default router
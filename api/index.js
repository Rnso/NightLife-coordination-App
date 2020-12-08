import express from 'express'
import { MongoClient, ObjectID } from 'mongodb'
import assert from 'assert'
import moment from 'moment'
import config from '../config'

let mdb;
MongoClient.connect(config.mongodbUri, (err, db) => {
    assert.equal(null, err)

    mdb = db
})
const router = express.Router()

/*router.get('/getallhangouts', (req, res) => {
    let date = moment().format('L')
    mdb.collection("hangouts").find({ createdDate: date }).toArray((err, data) => {
        res.send(data)
        console.log(data)
    })

})*/

router.get('/getallhangouts', (req, res) => {
    let date = moment().format('L')
    mdb.collection("hangouts").find({createdDate: date }).toArray((err, data) => {
        res.send(data)
    })

})

router.get('/getallcheckin/:id', (req, res) => {
    let date = moment().format('L')
    mdb.collection("hangouts").find({ id: req.params.id, createdDate: date }).toArray((err, data) => {
        res.send(data)
    })

})

router.post('/checkin', (req, res) => {
    let date = moment().format('L')
    let obj = {}
    obj.user = req.body.user
    obj.id = req.body.id
    obj.createdDate = date
    mdb.collection("hangouts").findOne({ user: req.body.user, id: req.body.id }).then(result1 => {
        if (result1) {
            mdb.collection("hangouts").update({ user: req.body.user, id: req.body.id }, { $set: { createdDate: date } }).then(result2 => {
                mdb.collection("hangouts").find({ id: req.body.id, createdDate: date }).toArray((err, total) => {
                    res.send(total)
                })
            })
        }
        else {
            mdb.collection("hangouts").insert(obj).then(result3 => {
                mdb.collection("hangouts").find({ id: req.body.id, createdDate: date }).toArray((err, data) => {
                    res.send(data)
                })
            })
        }

    })

})

router.post('/checkout', (req, res) => {
    let date = moment().format('L')
    console.log(req.body.id)
    mdb.collection("hangouts").remove({ user: req.body.user, id: req.body.id }).then(result => {
        //console.log(result)
        mdb.collection("hangouts").find({ id: req.body.id, createdDate: date }).toArray((err, data) => {
            res.send(data)
            console.log(data)
        })
    })

})


export default router
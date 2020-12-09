require('dotenv').config()

const env = process.env

export default{
    mongodbUri: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.wipan.mongodb.net/FCC?retryWrites=true&w=majority`,
    //mongodbUri: 'mongodb://localhost:27017/nightLife',
    port: env.PORT || 9000,
    host: env.HOST || '0.0.0.0'
}


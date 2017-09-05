const env = process.env

//export const nodeEnv = env.NODE_ENV || 'development'

export const API_KEY_PLACE = 'YOUR KEY'
export const API_KEY_GEOCODE = 'YOUR KEY'


export default{

    mongodbUri: 'mongodb://localhost:27017/nightLife',
    port: env.PORT || 9000,
    host: env.HOST || '0.0.0.0'
}


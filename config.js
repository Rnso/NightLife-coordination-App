const env = process.env

export const nodeEnv = env.NODE_ENV || 'development'

export const API_KEY_PLACE = 'PUT YOUR API_KEY'
export const CLIENT_ID = 'PUT YOU CLIENT_ID'


export default{
    mongodbUri: 'mongodb://localhost:27017/nightLife',
    port: env.PORT || 9000,
    host: env.HOST || '0.0.0.0'
}


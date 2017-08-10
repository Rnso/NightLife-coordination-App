const env = process.env

export const nodeEnv = env.NODE_ENV || 'development'

export const API_KEY_PLACE = 'AIzaSyBdMpshfj7xG_fcr6l3ph19KiHGE1_LVT0'
export const API_KEY_GEOCODE = 'AIzaSyDj4oDbphHS81GkioQqzVC43Et039KvFGQ'


export default{
    mongodbUri: 'mongodb://rnso:pongen@ds159892.mlab.com:59892/fcc',
    //mongodbUri: 'mongodb://localhost:27017/nightLife',
    port: env.PORT || 9000,
    host: env.HOST || '0.0.0.0'
}


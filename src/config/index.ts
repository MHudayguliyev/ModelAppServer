require('dotenv').config()

const ENV = {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    USER: process.env.USER,
    PASSWORD: process.env.PASSWORD,
    ACCESS_KEY: process.env.ACCESS_KEY,
    REFRESH_KEY: process.env.REFRESH_KEY,
    NODE_PORT: process.env.NODE_PORT
}


module.exports = ENV
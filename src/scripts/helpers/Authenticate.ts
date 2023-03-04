export {};
const {Response, Request} = require('express')
const jwt = require('jsonwebtoken')
const { ACCESS_KEY } = require('../../config/index')
const statuses = require('../utils/statuses')

const Authenticate = (req: any, res:any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]

    if(!token || token === null){
        return res.status(statuses.unauthorized).send('Please, sign in first!')
    }

    jwt.verify(token, ACCESS_KEY, (err:any, data:any) => {
        if(err){
            return res.status(statuses.error).send('Unauthorized')
        }
        req.user = data
        next()
    })
}

module.exports = Authenticate

const AuthenticateAdmin = (req: typeof Request, res: typeof Response, next: any) => {
    const header = req.header
}
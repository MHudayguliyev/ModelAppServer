export {};

const { Request, Response } = require('express')
const uuid = require('uuid').v4()
const database = require('../db/index')
const statuses = require('../scripts/utils/statuses')
const { HashPassword, ComparePassword, GenerateAccessToken, GenerateRefreshToken, VerifyRefreshToken } = require('../scripts/helpers/AuthHelpers')

const Login = async (req:typeof Request, res:typeof Response) => {
    const { username, password } = req.body

    const getUser:string = `select * from tbl_users where user_name = '${username}'`
    try {
        const {rows} = await database.query(getUser, [])
        if(!rows.length) {
            return res.status(statuses.notfound).send('This user not found')
        }

        console.log('rows', rows)

        const user = rows[0]
        const is_admin = user.is_admin
        const is_pass_same = await ComparePassword(password, user.user_password)

        if(!is_pass_same){
            console.log('ne to pasword')
            const message = {type:"manual", name:"password", message:"'Password' is incorrect"}
            return res.status(statuses.unauthorized).send({error: message})
        }
        
        const access_token = await GenerateAccessToken(user)
        const refresh_token = await GenerateRefreshToken(user)

        delete user.user_password
        const data = {
            data: user,
            access_token,
            refresh_token,
        }
        return res.status(statuses.success).send(data)
    } catch (error) {
        return res.status(statuses.error).send(error)
    }
}

const LoadUser = async(req: typeof Request, res: typeof Response) => {
    const authorization = req.headers.authorization
    try {
        if(!authorization){
            return res.status(statuses.unauthorized).send('Token not provided!')
        }

        let array = authorization.split(' ')
        let token: string  = '';

        for(let i:number = 0; i < array.length; i++){
            if(array[i] === 'Bearer'){
                token = array[i + 1]
                break;
            }
        }

        if(token === ''){
            return res.status(statuses.unauthorized).send('Token not provided!')
        }

        console.log('token', token)
        const response = await VerifyRefreshToken(token)
        if(response.status === 'Unauthorized'){
            return res.status(statuses.unauthorized).send(response.status)
        }
        console.log('res ', response)


        return res.status(statuses.success).send(response.data)
    } catch (error) {
        return res.status(statuses.error).send(error)
    }
}

const Register = async(req:typeof Request, res:typeof Response) => {
    const { username, email, password } = req.body
    let text:string = `select * from tbl_users where email='${email}'`
    try {
        const {rows} = await database.query(text, [])
        if(rows.length !== 0){
            return res.status(statuses.conflict).send('User already exists!')
        }
        const hash = await HashPassword(password)
        let insertQuery:string = `INSERT INTO tbl_users(user_guid, user_name, user_email, user_password)
                                VALUES('${uuid}', '${username}', '${email}', '${hash}') returning * `
        
        try {
            await database.queryTransaction([ { queryText: insertQuery, params: [] } ])
            return res.status(statuses.created).send('Successfully registered!')
        } catch (error) {
            console.log('Transaction error', error)
        }
    } catch (error) {
        return res.status(statuses.error).send(error)
    }
}

module.exports = {
    Register,
    Login,
    LoadUser
}
export {};
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const ENV = require('../../config/index')

const HashPassword = async(password: string) => {
    return bcrypt.hashSync(password, 8)
}

const ComparePassword = async (password: any, hash: any) => {
    const res = await bcrypt.compareSync(password, hash)
    return res
}

const GenerateAccessToken = async(data: any) => {
    return jwt.sign(data, ENV.ACCESS_KEY, { expiresIn: '1d' })
}

const GenerateRefreshToken = async (data: any) => {
    return jwt.sign(data, ENV.REFRESH_KEY, { expiresIn: "30d" });
};

const VerifyRefreshToken = async (token: string) => {
    return jwt.verify(token, ENV.REFRESH_KEY, async(err:any, user:any) =>  {
        console.log("user", user)
        if(err) {
            return { status: 'Unauthorized' }
        }
        const access_token = await GenerateAccessToken(user)
        delete user.user_password
        return {status: 'Verified', data: { access_token, user }}
    })
}

module.exports = {
    HashPassword,
    ComparePassword, 
    GenerateAccessToken, 
    GenerateRefreshToken,
    VerifyRefreshToken
}


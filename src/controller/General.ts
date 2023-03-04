export {}
const fs = require('fs')
const {transporter, setOptions} = require('../scripts/emailConfig/index')
const database = require('../db/index')
const statuses = require('../scripts/utils/statuses')
const {Response, Request} = require('express')

const GetModelForEdit = async (req: typeof Request, res: typeof Response) => {
    const {model_guid} = req.query

    if(!model_guid){
        return res.status(statuses.error).send('No model guid found to edit this model!, Please provide model guid')
    }

    let queryText: string = `
    SELECT model_guid, model_name, 
    model_price_value as price_value, 
    model_img_name, 
    model_zip_file_name as model_zip, 
    c.cat_name, 
    model_desc as desc
    FROM tbl_models m
    LEFT JOIN tbl_categories c on c.cat_guid = m.parent_guid
    where model_guid = '${model_guid}'`

    try {
        const { rows } = await database.query(queryText, [])
        if(!rows.length){
            return res.status(statuses.notfound).send(`Model with ${model_guid} not found in database!`)
        }
        return res.status(statuses.success).send(rows[0] ?? [])
    } catch (error) {
        console.log(error)
    }
}

const DeletePublicData = async (req: any, res: any) => {
    try {
        fs.rm(`public/attachments/files/`, {recursive: true}, () => {console.log(`zip files deleted from backend!`)})
        fs.rm(`public/attachments/images/`, {recursive: true}, () => {console.log(`images deleted from backend!`)})
    } catch (error) {
        console.log(error)
    }
}

const SendEmail = async (req: any, res: any) => {
    const {from, subject, template} = req.body

    try {
        const options = setOptions({from, subject, template})
        transporter.sendMail(options, (err: any) => {
            if(err) {
                console.log(err)
            }else {
                console.log('Message has been sent successfully!')
            }
        })

    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    GetModelForEdit,
    DeletePublicData,
    SendEmail
}

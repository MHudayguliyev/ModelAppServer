import getIsAccepted from "../scripts/utils/getIsAccepted"

export {}
const { Response, Request } = require('express')
const uuid = require('uuid')
const database = require('../db/index')
const statuses = require('../scripts/utils/statuses')
const DeleteFromPublic = require('../scripts/utils/deleteFromPublic')
const isEmpty = require("../scripts/utils/isEmpty")


const AdminModels = async (req: typeof Request, res: typeof Response) => {
    const {page, limit} = req.query
    console.log(req.query)

    const query_text: string = `
    SELECT
        model_guid,
        categories.data as categories, classes.data as classes,
        json_build_object(
            'tm', model_name_tm, 'ru', model_name_ru, 'en', model_name_en
        ) as model_names,
        l.model_line_format as formats, l.model_line_price,l.model_line_desc, 
        mf.model_image as model_img, mf.model_zip_file as model_zip,
        model_crt_date as crt_date, false is_liked
    FROM tbl_models m
    LEFT JOIN tbl_model_lines l on m.model_guid = l.model_head_guid
    LEFT JOIN tbl_model_files mf on mf.file_guid = l.model_line_file_guid
    LEFT JOIN (
        SELECT json_build_object(
        'value', cat_guid, 'label', (
                select json_build_object('tm', cat_name_tm, 'ru', cat_name_ru, 'en', cat_name_en) 
            )
        ) as data
        FROM tbl_categories  
    ) as categories on categories.data ->>'value'::text = m.parent_guid::text
    LEFT JOIN (
        SELECT class_guid,
            json_build_object(
                'value', class_guid, 'label', (
                    select json_build_object('tm', class_name_tm, 'ru', class_name_ru, 'en', class_name_en)
                )
            ) as data
        FROM tbl_classes
    ) as classes on classes.data ->>'value'::text = m.model_class_guid::text
    WHERE not is_model_accepted and is_model_deleted IS NULL 
    ORDER BY model_name_tm, model_name_ru, model_name_en ASC
    OFFSET ${page} * ${limit}
    LIMIT ${limit}
    `

    const getCount: string = `    
    SELECT 
        COUNT(1)::INT as count 
    FROM tbl_models 
    LEFT JOIN tbl_classes c on tbl_models.model_class_guid = c.class_guid
    WHERE not is_model_accepted and is_model_deleted IS NULL`

    try {
        const {rows} = await database.query(query_text, [])
        if(!rows.length){
            return res.status(statuses.nocontent).send(rows)
        }
        const adminModelCount = await database.query(getCount, [])
        const response = {
            data: rows,
            count: adminModelCount.rows[0].count
        }
        return res.status(statuses.success).send(response)
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send('Unknown error occured')
    }
}


const DeleteUnacceptedModel = async (req: any, res: any) => {
    const updateQuery = `UPDATE tbl_models SET is_model_deleted = now() WHERE model_guid = $1`
    console.log('params', req.params.modelGuid)

    try {
        const {rows} =  await database.query(updateQuery, [req.params.modelGuid])
        return res.status(statuses.success).send({status: statuses.success})
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send('Unknown error occured')
    }
}

/// update model by admin
const SaveChanges = async(req: any, res: any) => {
    const {modelGuid,categoryGuid,classGuid,formats,locales: {tm,ru,en},desc,price,modelImg, modelZip} = JSON.parse(req.query?.object)
    const user = req.user.user_guid
    const accepted: boolean = await getIsAccepted(modelGuid)
    console.log('accpeded', accepted)
    let zip: string=''

    // console.log('req files', req.files)
    // console.log('req user', req.user)
    console.log("req", JSON.parse(req.query?.object));

    if(req.files && req.files.length){
        for(let x of req.files){
            zip = x.filename
        }

        
        const {rows} = await database.query(`SELECT model_zip_file as zip FROM tbl_model_files mf WHERE model_head_guid=$1`,[modelGuid])
        console.log('rows', rows)
        if(rows.length){
            const deleted: boolean = DeleteFromPublic(rows[0])
            console.log('deleted', deleted)
            if(!deleted){
                return res.status(statuses.bad).send('Unknown error occured in zip deletion')
            }
            console.log(deleted)
        }
    }

    const deleteQuery: string = ` DELETE FROM tbl_models WHERE model_guid = $1`
    const queryText: string = `
        WITH parent AS (
            INSERT INTO tbl_models(model_guid,parent_guid,model_class_guid,model_user_guid,is_model_accepted,model_crt_date)
                VALUES('${modelGuid}','${categoryGuid}','${classGuid}','${user}',${accepted},NOW()) RETURNING model_guid
        ),
        file AS (
            INSERT INTO tbl_model_files(file_guid,model_zip_file,model_image,model_head_guid)
                VALUES('${uuid.v4()}','${zip.length ? zip : modelZip}','${modelImg}',(select model_guid from parent)) RETURNING file_guid
        )
        INSERT INTO tbl_model_lines(model_line_guid,model_head_guid,model_line_file_guid,model_name_tm,model_name_ru,model_name_en,model_line_price,model_line_format,model_line_desc)
            VALUES('${uuid.v4()}',(select model_guid from parent),(select file_guid from file),'${tm??''}','${ru??''}','${en??''}',${price?price:0},'${JSON.stringify(formats)}','${desc??''}')
    `
    
    try {
        const response = await database.queryTransaction([{queryText: deleteQuery, params: [modelGuid]}, {queryText, params: []}])
        console.log('res', response)
        return res.status(statuses.success).send({status: statuses.success})
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send('Unknown error occured')
    }

}

const UploadModel = async(req: any, res: any) => {
    const updateQuery: string = `UPDATE tbl_models SET is_model_accepted = ${true} WHERE model_guid = $1`
    console.log(req.params.modelGuid)

    try {
        const {rows} = await database.query(updateQuery, [req.params.modelGuid])
        return res.status(statuses.success).send({status: statuses.success})
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send('Unknown error occured')
    }
}


// const UploadModel = async(req:typeof Request, res: typeof Response) => {
//     const {md_guid, cat_guid, tm, en, ru, md_desc, md_price, date, class_guid, format_guid} = JSON.parse(req.query.object)
//     if(!req.files){
//         return res.status(statuses.notFound).send({msg: 'No file selected, Please select a file first!'})
//     }

//     let zip_file: string = ''
//     const data = [...req?.files]
    
//     for(let i = 0; i < data.length; i++){
//         if(data[i].mimetype.startsWith('application')){
//             zip_file = data[i].filename
//         }
//     }
//     const getAModel: string = `SELECT model_zip_file_name as zip FROM tbl_models WHERE model_guid = $1`
//     const queryText: string = `WITH deleted AS (
//         DELETE FROM tbl_models WHERE model_guid=$1 RETURNING model_guid, model_img_name as img
//     )
//     INSERT INTO tbl_models(model_guid, parent_guid, model_name_tm, model_name_ru, model_name_en, model_img_name, model_zip_file_name, model_price_value, model_desc, is_accepted, model_class_guid, model_format_guid, model_created_date)
//         VALUES((select model_guid from deleted), '${cat_guid}', '${tm}', '${ru}', '${en}', (select img from deleted), '${zip_file ?? ''}', ${md_price}, '${md_desc}', ${true}, '${class_guid}', '${format_guid}', '${date}')
//     `
//     try {
//         const {rows} = await database.query(getAModel, [md_guid])
//         if(!rows || !rows.length) {
//             return res.status(statuses.bad).send({msg: `No model found with this id: ${md_guid}`})
//         }
    
//         const response = DeleteFromPublic(rows[0])
//         if(response){
//             await database.queryTransaction([{ queryText,  params: [md_guid] }])
//             return res.status(statuses.success).send({ response: 'Successfully edited model!', status: statuses.success })
//         }

//         return res.status(statuses.bad).send('Operation not successfull')
//     } catch (error: any) {
//         console.log(error)
//         return res.status(statuses.error).send({msg: 'Unknown error occured!'})
//     }
// }

module.exports = {AdminModels, DeleteUnacceptedModel, SaveChanges, UploadModel}
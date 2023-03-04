export {}

const uuid = require('uuid')
const { Request, Response } = require('express')
const database = require('../db/index')
const statuses = require('../scripts/utils/statuses')

const Upload = async (req: typeof Request, res: typeof Response) => {
    const { id,tm,ru,en,desc,price,date,class_guid,formats } = JSON.parse(req.query?.object)
    const user = req.user.user_guid
    console.log('from frontend', JSON.parse(req.query?.object))

    if(!req.files || !req.files?.length){
        return res.status(statuses.bad).send({msg: req.t('NoFileSelected')})
    }
    if(!id) {
        return res.status(statuses.bad).send('Please provide category id!')
    }

    let img_file: string = ''
    let zip_file: string = ''
    const data = [...req?.files]

    for(let i = 0; i < data.length; i++){
        if(data[i]?.mimetype.startsWith('image')){
            img_file = data[i]?.filename
        }
        if(data[i]?.mimetype.startsWith('application')){
            zip_file = data[i]?.filename
        }
    }


    const queryText: string = `
        WITH model_head AS (
            INSERT INTO tbl_models(model_guid,parent_guid,model_class_guid,model_user_guid,is_model_accepted,model_crt_date)
                VALUES('${uuid.v4()}','${id}','${class_guid}','${user}',${false},NOW())
                    RETURNING model_guid
        ),
        model_files AS (
            INSERT INTO tbl_model_files(file_guid,model_head_guid,model_zip_file, model_image) 
                VALUES('${uuid.v4()}', (select model_guid from model_head), '${zip_file ?? ''}', '${img_file ??''}') RETURNING file_guid
        )
        INSERT INTO tbl_model_lines(model_line_guid,model_head_guid,model_line_file_guid,model_name_tm,model_name_ru,model_name_en,model_line_price,model_line_format,model_line_desc)
            VALUES('${uuid.v4()}',(select model_guid from model_head),(select file_guid from model_files),'${tm??''}','${ru??''}','${en??''}',${price?price:0},'${JSON.stringify(formats)}','${desc??''}')
    `

    try {
        await database.queryTransaction([ { queryText, params: [] } ])
        return res.status(statuses.success).send({ msg: req.t('SuccessfullyUpload'),  status: statuses.created})
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send(error)
    }
}



const GetFormats = async (req: typeof Request, res: typeof Response) => {
    const query_types: string = `SELECT * from tbl_model_formats`

    try {
        const {rows} = await database.query(query_types, [])
        return res.status(statuses.success).send(rows)
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send('Unknown error occured')
    }
}

const GetClasses = async (req: typeof Request, res: typeof Response) => {
    const get_classes: string = `
    SELECT
        json_agg(json_build_object(
            'class_guid', class_guid, 'tm', class_name_tm, 'ru', class_name_ru, 'en', class_name_en
        )) as classes
    FROM tbl_classes
    `

    try {
        const {rows} = await database.query(get_classes, [])
        return res.status(statuses.success).send(rows[0]?.classes)
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send('Unknown error occured')
    }

}


module.exports = {Upload, GetFormats, GetClasses}
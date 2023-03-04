export {}

const {Request, Response} = require('express')
const database = require('../db/index')
const statuses = require('../scripts/utils/statuses')

const GetSelectedModel = async (req: typeof Request, res: typeof Response) => {
    const {modelGuid} = req.query
    console.log(req.query)
    let queryText: string = `SELECT
	model_guid,
	parent_guid,
	model_name_tm as tm,
    model_name_ru as ru,
    model_name_en as en,
	model_price_value as price_value,
	model_img_name,
	model_zip_file_name as model_zip,
    model_desc as desc
FROM
	tbl_models
    WHERE model_guid = $1
    ORDER BY model_img_name`

    try {
        const {rows} = await database.query(queryText, [modelGuid])
        if(!rows.length){
            return res.status(statuses.notfound).send('Material not found')
        }

        return res.status(statuses.success).send(rows)
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send('Unknown error')
    }
}


const GetRecommendations = async (req: typeof Request, res: typeof Response) => {
    const {parentGuid} = req.query
    let queryText: string = `SELECT
	model_guid,
	parent_guid,
	model_name_tm as tm,
    model_name_ru as ru,
    model_name_en as en,
	model_price_value as price_value,
	model_img_name,
	model_zip_file_name as model_zip,
    model_desc as desc
FROM
	tbl_models 
	left join tbl_categories on tbl_categories.cat_guid = tbl_models.parent_guid
	where tbl_categories.cat_guid = $1`

    try {
        const {rows} = await database.query(queryText, [parentGuid])
        return res.status(statuses.success).send(rows)
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send('Unknown error')
    }
}

module.exports = {
    GetSelectedModel,
    GetRecommendations
}
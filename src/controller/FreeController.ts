export {};

const { Request, Response } = require('express')
const database = require('../db/index')
const statuses = require('../scripts/utils/statuses')

const GlobalSearch = async (req: typeof Request, res: typeof Response) => {
    const {search, route} = req.query

    const searchReplaced: string = search.replaceAll(' ', '%')
    const isModelAccepted: string = route==='/free/' ? 
        `is_model_accepted AND classes.data#>>'{label, "en"}' = 'Free'` :
        route==='/admin-control' ?  
        'NOT is_model_accepted and is_model_deleted IS NULL' : 
        ''
  
    let searchPart: string = `LOWER(concat(
        model_name_en, model_name_ru,model_name_tm, l.model_line_price,l.model_line_desc,l.model_line_format,classes,categories,
        classes, l.model_line_format,l.model_line_desc,l.model_line_price,model_name_tm,model_name_ru,model_name_en
    )) LIKE LOWER(N'%${searchReplaced}%')`
    let orderByPart: string = ` ORDER BY model_name_tm, model_name_ru, model_name_en ASC`     
    let wherePart: string = ` WHERE ${isModelAccepted} and ${searchPart}`
    let search_query: string = `
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
	${wherePart} ${orderByPart}`

    
    let getCount: string = `
    SELECT
        count(*)::INT
    FROM tbl_models m
    LEFT JOIN tbl_model_lines l on m.model_guid = l.model_head_guid
    LEFT JOIN (
    SELECT class_guid,
        json_build_object(
            'value', class_guid, 'label', (
                select json_build_object('tm', class_name_tm, 'ru', class_name_ru, 'en', class_name_en)
            )
        ) as data
    FROM tbl_classes
    ) as classes on classes.data ->>'value'::text = m.model_class_guid::text
    
    LEFT JOIN (
    SELECT json_build_object(
       'value', cat_guid, 'label', (
            select json_build_object('tm', cat_name_tm, 'ru', cat_name_ru, 'en', cat_name_en) 
        )
    ) as data
    FROM tbl_categories  
    ) as categories on categories.data ->>'value'::text = m.parent_guid::text
    ${wherePart}

`   
    /*WHERE is_model_accepted and classes.data#>>'{label, "en"}' = 'Free' AND

    lower(concat(model_name_en, model_name_ru,model_name_tm, l.model_line_price,l.model_line_desc,l.model_line_format,classes,categories,
    classes, l.model_line_format,l.model_line_desc,l.model_line_price,model_name_tm,model_name_ru,model_name_en)) 
    LIKE LOWER(N'%Животные%') */

    try {
        const {rows} = await database.query(search_query, [])
        if(!rows.length){
            return res.status(statuses.nocontent).send(rows)
        }

        const modelsCount = await database.query(getCount, [])
        const response = {
            data: rows,
            count: modelsCount.rows[0].count
        }

        console.log("response", response)

        return res.status(statuses.success).send(response)
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send('Unknown error occured!')
    }
}

const GetCategories = async (req: typeof Request, res:typeof Response) => {
    let getCategories: string = `
    select 
        json_agg(json_build_object(
                'cat_uuid', cat_guid, 'icon', cat_icon,
                'tm', cat_name_tm, 'ru', cat_name_ru, 'en', cat_name_en
            )) as data
    from tbl_categories` 

    try {
        const {rows} = await database.query(getCategories, [])
        if(!rows.length){
            return res.status(statuses.notfound).send(req.t('NoCategoryFound'))
        }
        return res.status(statuses.success).send(rows?.[0].data)
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send(error)
    }
};

const GetModels = async (req: typeof Request, res: typeof Response) => {
    const { limit, page, parent_guid, model_guid } = req.query
    console.log(req.query)

    let wherePart:string=`WHERE is_model_accepted and classes.data#>>'{label, "en"}' = 'Free'`
    let withCategory:string = ` AND parent_guid = '${parent_guid}'`
    let orderByPart:string = `ORDER BY model_name_tm, model_name_ru, model_name_en ASC `
    let paginationPart:string = ` OFFSET ${page} * ${limit} LIMIT ${limit}`
    if(!parent_guid){   
        orderByPart += paginationPart
    }else if(parent_guid && model_guid) {
        wherePart += ` AND parent_guid = '${parent_guid}' AND model_guid != '${model_guid}'`
        orderByPart += paginationPart
    }
    else if(parent_guid) {
        wherePart += withCategory
    }

    let text: string = `
    SELECT
        model_guid,
        categories.data as categories, classes.data as classes,
        json_build_object(
            'tm', model_name_tm, 'ru', model_name_ru, 'en', model_name_en
        ) as model_names,
        l.model_line_format as formats, l.model_line_price,l.model_line_desc as desc, 
        mf.model_image as model_img, mf.model_zip_file as model_zip,
        model_crt_date as crt_date, false as is_liked
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
    ${wherePart} ${orderByPart} 
 `

    let getCount: string = `
    SELECT 
	    COUNT( * )::INT 
    FROM tbl_models 
    LEFT JOIN tbl_classes c on tbl_models.model_class_guid = c.class_guid
    WHERE is_model_accepted AND c.class_name_en = 'Free' ${parent_guid ? withCategory : ''}
    `
    
    try {
        const { rows } = await database.query(text, [])
        if(!rows.length){
            return res.status(statuses.nocontent).send(rows)
        }

        const modelCount = await database.query(getCount, [])
        const response = {
            data: rows,
            count: modelCount.rows[0].count
        }
        // console.log('res data', response.data)
        return res.status(statuses.success).send(response)
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send(error)
    }
}


const GetSelectedModel = async (req: typeof Request, res: typeof Response) => {
    const getModel: string = `
    SELECT 
    model_guid, parent_guid, 
    json_build_object('tm', model_name_tm, 'ru', model_name_ru, 'en', model_name_en) as model_names,
    json_build_object('tm', cats.cat_name_tm, 'ru', cats.cat_name_ru, 'en', cats.cat_name_en) as categories,
    json_build_object('tm', cl.class_name_tm, 'ru', cl.class_name_ru, 'en', cl.class_name_en) as classes,
    model_line_format as formats, model_line_desc as desc, model_line_price,
    /*c.currency_name*/
    mf.model_zip_file as model_zip, mf.model_image as model_img,
    model_crt_date as crt_date, false as is_liked
    FROM tbl_models m
    INNER JOIN tbl_categories cats on cats.cat_guid = m.parent_guid
    INNER JOIN tbl_model_lines ml on m.model_guid = ml.model_head_guid
    INNER JOIN tbl_classes cl on cl.class_guid = m.model_class_guid
    INNER JOIN tbl_users us on us.user_guid = m.model_user_guid
    INNER JOIN tbl_model_files mf on mf.file_guid = ml.model_line_file_guid
    /* INNER JOIN tbl_currency c on c.currency_guid = ml.model_line_currency_guid */
    WHERE model_guid = $1 and cl.class_name_en='Free'
    `

    try {
        const {rows} = await database.query(getModel, [req.params.modelGuid])
        return res.status(statuses.success).send(rows[0])        
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send('Unknown error occured')
    }
}

const GetOfSameCategories = async (req: typeof Request, res: typeof Response) => {
    const getModels: string= `
    SELECT
    model_guid,
    categories.data as categories, classes.data as classes,
    json_build_object(
        'tm', model_name_tm, 'ru', model_name_ru, 'en', model_name_en
    ) as model_names,
    l.model_line_format as formats, l.model_line_price,l.model_line_desc as desc, 
    mf.model_image as model_img, mf.model_zip_file as model_zip,
    model_crt_date as crt_date, false as is_liked
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
WHERE is_model_accepted and classes.data#>>'{label, "en"}' = 'Free' and parent_guid=$1 and model_guid != $2
ORDER BY model_name_tm, model_name_ru, model_name_en
    `

    try {
        const {rows} = await database.query(getModels, [req.params.categoryGuid,req.params.modelGuid])
        return res.status(statuses.success).send(rows)
    } catch (error) {
        console.log(error)
        return res.status(statuses.error).send('Unknown error occured')
    }
}

const FilterByUsers = async (req: typeof Request, res: typeof Response) => {
    const {page, limit, user} = req.query
   const queryText: string = `
   SELECT
        model_guid,
        categories.data as categories, classes.data as classes,
        json_build_object(
            'tm', model_name_tm, 'ru', model_name_ru, 'en', model_name_en
        ) as model_names,
        l.model_line_format as formats, l.model_line_price,l.model_line_desc as desc, 
        mf.model_image as model_img, mf.model_zip_file as model_zip,
        model_crt_date as crt_date
    FROM tbl_models m
    LEFT JOIN tbl_model_lines l on m.model_guid = l.model_head_guid
    LEFT JOIN tbl_model_files mf on mf.file_guid = l.model_line_file_guid
    LEFT JOIN tbl_users u on u.user_guid = m.model_user_guid
    LEFT JOIN (
    SELECT cat_guid, json_build_object(
        'tm', cat_name_tm, 'ru', cat_name_ru, 'en', cat_name_en
    ) as data
    FROM tbl_categories  
    ) as categories on categories.cat_guid = m.parent_guid
    LEFT JOIN (
    SELECT class_guid,
        json_build_object(
            'tm', class_name_tm, 'ru', class_name_ru, 'en', class_name_en
        ) as data
    FROM tbl_classes
    ) as classes on classes.class_guid = m.model_class_guid
    WHERE is_model_accepted and classes.data ->> 'en' = 'Free' and user_guid=$1
    OFFSET ${page} * ${limit}
    LIMIT ${limit}`

    try {
        const {rows} = await database.query(queryText, [user])
        return res.status(statuses.success).send(rows)
    } catch (error) {
        return res.status(statuses.success).send('Unknown error occured')
    }
}

// const FilterByFormat = async(req: typeof Request, res: typeof Response) => {
//     const {page, limit, format} = req.query
//     const queryText: string = `
//     SELECT 
//         t.model_guid,
//         categories.data as categories, classes.data as classes,
//         (select json_build_object(
//             'tm', t.model_name_tm, 'ru', t.model_name_ru, 'en', t.model_name_en
//         ) FROM tbl_models WHERE model_guid = t.model_guid) as model_names,
//         model_format as formats,
//         t.model_img_name as model_img, t.model_zip_file_name as model_zip,
//         t.model_desc as desc, t.model_price_value as price_value, is_accepted, 
//         t.model_created_date as crt_date
//     FROM tbl_models t 
//     LEFT JOIN tbl_classes c on c.class_guid = t.model_class_guid

//     LEFT JOIN (
//     SELECT cat_guid, json_build_object(
//         'value', cat_guid, 'tm', cat_name_tm, 'ru', cat_name_ru, 'en', cat_name_en
//     ) as data
//     FROM tbl_categories  
//     ) as categories on categories.cat_guid = t.parent_guid

//     LEFT JOIN (
//     SELECT class_guid,
//         json_build_object(
//             'tm', class_name_tm, 'ru', class_name_ru, 'en', class_name_en
//         ) as data
//     FROM tbl_classes
//     ) as classes on classes.class_guid = t.model_class_guid
//     WHERE is_accepted AND c.class_name_en = 'Free' and u.user_name = $1
//     ORDER BY t.model_name_en, t.model_name_ru, t.model_name_tm
//     OFFSET ${page} * ${limit}
//     LIMIT ${limit}
//     `
// }



module.exports = { 
    GlobalSearch,
    GetCategories,
    GetModels,
    GetSelectedModel,
    GetOfSameCategories,
}
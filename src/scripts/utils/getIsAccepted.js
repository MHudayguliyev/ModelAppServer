const database = require('../../db/index')

const getIsAccepted = async(modelGuid) => {
    const text = `select is_model_accepted from tbl_models where model_guid = $1`
    let response;
    try {
        const {rows} = await database.query(text, [modelGuid])
        if(rows.length > 0) {
            response = rows[0]['is_model_accepted']
        }else {
            console.log('No model with this id found!')
        }
    } catch (error) {
        console.log(error)
    }

    return response
}

module.exports = getIsAccepted
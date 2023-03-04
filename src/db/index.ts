declare var require: any
declare var module: any

const { Pool } = require('pg')
const ENV = require('../config/index')
export {}


const database = new Pool({
    user: ENV.DB_USER,
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    password: ENV.DB_PASSWORD,
    database: ENV.DB_NAME
})

module.exports = {
    async query(text: string, params: string[] | any){
        const res = await database.query(text, params)
        return res
    },

    async queryTransaction(query_list: any) {
        const client = await database.connect();
        try {
        await client.query("BEGIN");
        let response: any = [];
        for (const query of query_list) {
            const { rows } = await client.query(query.queryText, query.params);
            response = response.concat(rows);
        }
        await client.query("COMMIT");
        return response
        } catch (e) {
        await client.query("ROLLBACK");
        throw e;
        } finally {
        client.release();
        }
    }
}

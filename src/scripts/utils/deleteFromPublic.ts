const fs = require('fs')

const DeleteFromPublic = (row: Array<string> | any) => {
    if(!row){
        return false
    }
    
    if(row){
        fs.rm(`public/attachments/files/${row['zip']}`, {recursive: true}, () => {console.log(`zip deleted from backend!`)})
        return true
    }

    return false
}

module.exports = DeleteFromPublic
export {}
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        let destination: string = `public/attachments`
        if(file && file.mimetype){
            if(file.mimetype.startsWith('image')){
                destination += `/images`
                cb(null, destination);
                destination = ''
            }
            if(file.mimetype.startsWith('application')){
                destination += `/files`
                cb(null, destination);
                destination = ''
            }
        }
    },
    filename: (req:any, file: any, cb: any) => {
        let filename = ""
        let now =  Date.now()
        if(file && file.mimetype){
            if(file.mimetype.startsWith('image')){
                filename += `${now}-${file.originalname}`
                cb(null, filename);
                filename = ''
            }
            if(file.mimetype.startsWith('application')){
                filename += `${now}-${file.originalname}`
                cb(null, filename);
                filename = ''
            }
        }
    }
})


const isFile = (req: any, file: any, cb: any) => {
    if(file.mimetype.startsWith('image') || file.mimetype.startsWith('application')){
        return cb(null, true)
    }else {
        return cb(new Error('Only image or zip/rar file allowed!'))
    }
}

const upload = multer({ storage: storage, fileFilter: isFile }).array('attachment')

function Upload(req: any, res:any, next: any) {
    upload(req, res, (err: any) => {
        if(err instanceof multer.MulterError){
            return res.status(400).send('Not Uploaded!')
        }else if(err){
            return res.status(400).send('Unkown error occured!')
        }
        next()
    })
}

module.exports = Upload
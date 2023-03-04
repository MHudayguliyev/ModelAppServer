const nodemailer = require('nodemailer')
const {USER, PASSWORD} = require("../../config/index")

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: USER,
        pass: PASSWORD
    }
})

export const setOptions = ({from, subject, template}: {from: string,subject:string,template:string}) => {
    const options = {
        from: from,
        to: USER,
        subject: subject,
        html: `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
          </head>
          <body>
                <h4>Hello from ${from}</h4> <br></br>
                <p>${template}</p>
          </body>
        </html>
        `
    }

    return options
}
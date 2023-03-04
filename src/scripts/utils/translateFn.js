const translate = require('@iamtraction/google-translate');

const TranslateFn = async (text, from, to) => {
    const res = await translate(text, {from: from, to: to})
    return res.text
}

module.exports = TranslateFn
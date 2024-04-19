const api = require("./apis")
const nacl = require("tweetnacl")
const b58 = require("b58")

const dotenv = require("dotenv")

var sign_kp = nacl.sign.keyPair.fromSecretKey(
    b58.decode(
        process.env.EMIT_KP
    )
)

async function invoice_achive(invoiceId,hash,from,to,amountSend,amountFee,transactionType,token,block)
{
    //make invoice struct and sign
    var invoice = {
        invoiceId : invoiceId,
        sign :{
            invoiceId : invoiceId,
            hash : hash,
            from : from,
            to : to,
            amountSend :amountSend,
            amountFee : amountFee,
            transactionType : transactionType,
            token:token,
            block:block
        }
    }

    //Sign the data;
    invoice.sign = callback_sign(invoice.sign)

    //Send out request

    return await api.newInvoiceEmit(invoice,'invoice')
}

function callback_sign(data)
{
    return b58.encode(
        nacl.sign(
            Buffer.from(JSON.stringify(data))
            ,sign_kp.secretKey
            )
    )
}

function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

module.exports = {
    invoice_achive
}
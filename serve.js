

var querystring = require('querystring');
var express = require('express');
const fs = require("fs");
var bot;
var app = express();
var bodyParser = require('body-parser');
const utils = require("./utils/index")
const nacl = require("tweetnacl")
const b58 = require("b58")
const auth = require("./utils/auth");
require('dotenv').config()
app.use(auth.auth);
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.listen(6555, async function() {
    console.log('monitor-http-call-server start')
})
app.get('/ping', auth.auth,async function(req, res) {
    res.status(200).send({
        "code": 200,
        "data": "pong"
    })
})

app.post('/emit/:type',auth.auth, async function(req, res) {
    console.log(req.body,req.params.type)
    var ret = await invoice_emit(req.body,req.params.type)
    res.status(200).send({
        "code": 200,
        "data": ret
    })
})

function decode(rawData)
{
try{
    var signKp = b58.decode(
        process.env.EMIT_PK
    )

    const signData = b58.decode(rawData);

    const decodeData = nacl.sign.open( signData, signKp.publicKey)

    const finalData = JSON.parse(
        Buffer.from(decodeData).toString()
    )

    return finalData;
}catch(e){console.error(e)}
return false;
}


/**
 * 
 * @param {*} body 
 * 
 * {
 *    "invoiceId":"",
 *    "sign":""
 * }
 * 
 * sign : 
 * 
{
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
 */

async function invoice_emit(body,type)
{
  if(body && body.invoiceId && body.sign)
  {
    if(type == 'invoice')
    {
    //Check if invoice exist ;
    const invoice = await utils.db.getInvoiceById(body.invoiceId)
    console.log(invoice)
    //Decode sign with public key
    const rawData = decode(body.sign);
    console.log(rawData)
    //Emit invoice success and invoice callback 
    }
  }


}
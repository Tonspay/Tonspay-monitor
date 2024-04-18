

var querystring = require('querystring');
var express = require('express');
const fs = require("fs");
var bot;
var app = express();
var bodyParser = require('body-parser');

const auth = require("./utils/auth");

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

app.post('/emit',auth.auth, async function(req, res) {
    var ret = await invoice_emit(req.body)
    res.status(200).send({
        "code": 200,
        "data": ret
    })
})

/**
 * 
 * @param {*} body 
 * 
 * {
 *    "invoiceId":"",
 *    "sign":""
 * }
 */

async function invoice_emit(body)
{
  //Check if invoice exist ;

  //Decode sign with public key

  //Emit invoice success and invoice callback 

}
init()
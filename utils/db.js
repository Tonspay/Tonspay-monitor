var MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
    //DB name
const mainDB = "tonspay"

//Sheet name
const sInvoice = "invoices";
const sCallback = "callback"
//DB struct

const merchantPaymentMethodStruct = {
    uid: 0, //merchantId
    methodId: 0, //PaymentMethodId uid+timestamp+type to string(36)
    type: 0, // Type of payment : 0:TON | 1:SOL | 2:ARB | 3:Binance | 4:BSC
    address: "", // Address to recive payment 
    callback : "",
    label: "" //Name for merchant remember
}
const invoiceStruct = {
    id: 0, //Invoice id : uid+timestamp+invoiceCont to string(36)
    uid: 0, //merchantId
    amount: 0, //Amount in int . decimails : 8 
    amountUsd: 0,
    type: 0, //payment type :: 0:Mainnet token , 1:USDT , 2:USDC , 3:DAI (Different chain have different token )
    token: 0, //Payment Token type 
    createTime: 0,
    methodId: -1, //PaymentMethodId default -1 : allows all kinds of payment . 
    status: 0, //Payment status : 0 : Pending | 1 : Pay success | 2 : Pay cancel
    comment: "", //The invoice comment for user 
    callback : "",
    paymentResult: {}
}
const paymentResultStruct =
{
    "paymentDetails": {
        "from":"",//The address of payer
        "amount":0,//How much this transaction paid on chain .
        "hash" : "",//The transaction hash of this payment . 
    }, //Token payment hash
    "routerFeeDetails":{
        "from":"",//The address of payer . 
        "amount":"",//How much being charged by payment router .
        "hash" : "" , //The sub transaction of router fee .
        "isPrepaid":true, //If this transaction being prepaird by merchant by Token . 
    },
    "timestamp":0//Callback time
}

const callbackStruct = {
    uid : 0, //Invoice owner
    hash : "",//the hash of payment invoice
    invoice:"",//Invoice Id
    path : "",//Call back url
    createTime:0,//Request time
}

function unique(arr) {
    var obj = {};
    return arr.filter(function(item, index, arr) {
        return obj.hasOwnProperty(typeof item + item) ? false : (obj[typeof item + item] = true)
    })
}

/**
 * Invoice system
 */

async function getInvoiceById(data) {
    const pool = await MongoClient.connect(process.env.SQL_HOST)
    var db = pool.db(mainDB);
    var ret = await db.collection(sInvoice).find({
        id: data
    }).project({}).toArray();
    await pool.close();
    if (ret.length > 0) {
        return ret[0]
    }
    return false;
}

async function payInvoice(id, paymentResult) {
    const pool = await MongoClient.connect(process.env.SQL_HOST)
    var db = pool.db(mainDB);
    await db.collection(sInvoice).updateMany({
        id: id
    }, {
        "$set": {
            status: 1,
            paymentResult : paymentResult
        }
    });
    await pool.close();
    return true;
}

/**
 * Call back history . 
 */
async function getCallbackByOrder(invoice) {
    const pool = await MongoClient.connect(process.env.SQL_HOST)
    var db = pool.db(mainDB);
    var ret = await db.collection(sCallback).find({
        invoice: invoice
    }).project({}).toArray();
    await pool.close();
    if (ret.length > 0) {
        return ret
    }
    return false;
}

async function getCallbackByOwner(owner) {
    const pool = await MongoClient.connect(process.env.SQL_HOST)
    var db = pool.db(mainDB);
    var ret = await db.collection(sCallback).find({
        uid: owner
    }).project({}).toArray();
    await pool.close();
    if (ret.length > 0) {
        return ret
    }
    return false;
}

async function newCallback(uid,invoice,path) {
    const pool = await MongoClient.connect(process.env.SQL_HOST)
    var db = pool.db(mainDB);
    var ret = await db.collection(sCallback).insertOne(
        {
            uid :uid, //Invoice owner
            invoice:invoice,//Invoice Id
            path :path,//Call back url
            createTime:Date.now(),//Request time
        }
    );
    await pool.close();
    return ret;
}

module.exports = {
    payInvoice,
    getInvoiceById,
    unique,
    getCallbackByOrder,
    newCallback,
    getCallbackByOwner
}
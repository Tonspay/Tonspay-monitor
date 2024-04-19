const api = require("./apis")
const db = require("./db")
const nacl = require("tweetnacl")
const b58 = require("b58")

const dotenv = require("dotenv")

const tonweb = require("tonweb")

const callback_sleep = 3000

var sign_kp = nacl.sign.keyPair.fromSecretKey(
    b58.decode(
        process.env.CALLBACK_KP
    )
)

async function invoice_achive(invoiceId,hash,from,to,amountSend,amountFee,transactionType,token,block)
{
    //Verfiy if the invoice exsit , and check the invoice payment data .
    const invoice = await db.getInvoiceById(invoiceId);

    //Check invoice status . 
    if(invoice.status != 0 )
    {
        console.log(`🐞 Invoice ${invoice.id} already paid . recall hash : ${hash}`)
        return false ;
    }

    //Prehandel of some chain invoice 
    if(invoice.type == 0)
    {
        from = (new tonweb.utils.Address(from)).toString(false)
        to = (new tonweb.utils.Address(to)).toString(false)
        invoice.address = (new tonweb.utils.Address(invoice.address)).toString(false)
    }

    if(invoice
        && invoice.amount >= amountSend
        && invoice.type == transactionType 
        && invoice.token == token
        && invoice.address.toLowerCase() == to.toLowerCase()
        && invoice.callback)
    {
        
        const paymentResult = {
            "paymentDetails": {
                "from":from,
                "amount":Number(amountSend),
                "hash" : hash,
            }, 
            "routerFeeDetails":{
                "from":from,
                "amount":amountFee,
                "hash" :hash ,
                "isPrepaid":invoice.isPrepaid,
            },
            "timestamp":Date.now()
        }
        await db.payInvoice(invoiceId,paymentResult);
        const callbackStruct = {
            "uid":invoice?.uid, //Your merchant user id in telegram bot . Please verfiy if it is your callback.
            "invoiceId":invoice?.id.toLowerCase(),//Which invoice this callback for . 
            "paymentMethod":invoice?.methodId,//The payment method of the invoice . 
            "confirmedBlock":block, //How many block since the callback confirm . 
            "paymentDetails":paymentResult.paymentDetails,
            "routerFeeDetails":paymentResult.routerFeeDetails,
            "createTime":Date.now()//The time of this callback .
        }
        const sign = callback_sign(callbackStruct)
        console.log("🐞 Call back sign :: ",sign)
        try{
            api.callbackRequest(invoice.callback,{sign:sign});
        }catch(e)
        {
            console.error(e)
        }
        
        await db.newCallback(
            invoice.uid,
            invoice.id,
            invoice.callback
        )
        await sleep(callback_sleep);
    }else{
        console.error("🐞 Payment not match any ..." , invoice,invoiceId,hash,from,to,amountSend,amountFee,transactionType,token,block)
    }
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
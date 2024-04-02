const orb = require("@orbs-network/ton-access");
const ton = require('@ton/ton')

const grp  = require('graphql-request')

const tonweb = require("tonweb")

const endpoint = 'https://dton.io/graphql/'

const utils = require("../utils/index")

require('dotenv').config()

const tonapiWs = `wss://tonapi.io/v2/websocket?token=${process.env.TONVIWER_API}`

var lastInvoiceHash = "";

function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}
// test()

async function getTonTransactions(address,page)
{
    const query = grp.gql`
    query {
      transactions(
          address_friendly: "${address}"
          page_size: ${page}
          page : 0
          ){
          gen_utime
          lt
          account_storage_balance_grams
          in_msg_op_code
          out_msg_count
          out_msg_body
          in_msg_body
          in_msg_src_addr_address_hex
          in_msg_src_addr_workchain_id
          hash
        }
        
    }
  `
    var r=false;
    await grp.request(endpoint, query).then((data) => {
        r = data;
    }).catch((error) => {
        console.error(error)
    })
    return r;
}
async function getTonTransactionsByHash(hash)
{
    const query = grp.gql`
    query {
      transactions(
          hash: "${hash}"
          ){
          gen_utime
          lt
          account_storage_balance_grams
          in_msg_op_code
          out_msg_count
          out_msg_body
          in_msg_body
          in_msg_src_addr_address_hex
          in_msg_src_addr_workchain_id
          hash
        }
        
    }
  `
    var r=false;
    await grp.request(endpoint, query).then((data) => {
        r = data;
    }).catch((error) => {
        console.error(error)
    })
    return r;
}

async function getTonLastHash(address)
{
    const query = grp.gql`
    query {
      transactions(
          address_friendly: "${address}"
          page_size: 1
          page : 0
          ){
          hash
        }
    }
  `
    var r=false;
    await grp.request(endpoint, query).then((data) => {
        r = data;
    }).catch((error) => {
        console.error(error)
    })
    return r;
}


async function getTonTransactionByHash(hash)
{
    try{
        return await utils.api.getTonTransactionByHash(hash)
    }catch(e)
    {console.error(e)}
    return false;
}

async function getTonMotherTransactionByChild(hash,i)
{
    try{
        await sleep(15000)
        const child =  await utils.api.getToncenterTransactionByHash(hash)
        await sleep(5000)
        console.log(child);
        console.log(JSON.stringify(child))
        if(child && child?.transactions && child.transactions.length>0 && child.transactions[0]?.in_msg && child.transactions[0].in_msg.hash)
        {
            const inMsgHash = child.transactions[0].in_msg.hash
            const father = await utils.api.getToncenterTransactionByMessage('out',inMsgHash)
            console.log(father)
            console.log(JSON.stringify(father))
            if(father && father?.transactions&&father.transactions.length>0)
            {
                return {
                    tx : father.transactions[0],
                    book : father.address_book
                }
            }else{
                if(i<10)
                {
                    return await getTonMotherTransactionByChild(hash,i++)
                }
                
            }
        }
    }catch(e)
    {console.error(e)}
    return false;
}

async function getTonMotherTransactionByHash(hash)
{
    try{
        await sleep(10000)
        const father =  await utils.api.getToncenterTransactionByHash(hash)
        if(father && father?.transactions && father.transactions.length>0)
        {
            return {
                tx : father.transactions[0],
                book : father.address_book
            }
        }
    }catch(e)
    {console.error(e)}
    return false;
}


async function checkNewTxn()
{
    const tx = await getTonLastHash(process.env.LISTEN_TON,1);
    if(tx && tx?.transactions && tx.transactions.length > 0 &&tx.transactions[0].hash != lastInvoiceHash)
    {
        return false;//No new invoice
    }
    return true;
}


function tryDecodeMsg(transaction)
{
    try{
        const bs = tonweb.boc.Cell.fromBoc(Buffer.from(transaction.in_msg_body,'base64').toString('hex'))
        const txt = Buffer.from(bs[0].bits.toHex(),"hex").toString('utf-8'); 
        var ret = "";
        for(i = 4; i<txt.length ; i ++ )
        {
            ret+=txt[i]
        }
        return ret;
    }catch(e)
    {
        // console.error(e)
    }
    return false;
}

function checkIsReachPageLimit(data)
{
    var ret = false;
    data.forEach(e => {
        if(e.hash == lastInvoiceHash)
        {
            ret = true;
        }
    });
    return ret;
}


async function achive(hash)
{
    try{
        if(hash)
        {
            console.log("🐞 achive hash  :",hash)
            //TODO check if the txn valid . 
            const rawTx =  await getTonMotherTransactionByChild(hash.toLowerCase());
            const tx =rawTx.tx;
            const book = rawTx.book;
            console.log(rawTx)
            if(tx && tx?.out_msgs && tx.out_msgs.length == 2)
            {
                const sender = book[tx.out_msgs[0].source]?.user_friendly.toLowerCase();
                const senderFee = tx.out_msgs[0].value
                const reciver = book[tx.out_msgs[0].destination]?.user_friendly.toLowerCase();
                const router = book[tx.out_msgs[1].destination]?.user_friendly.toLowerCase();
                const routerFee = tx.out_msgs[1].value
                const id = tx.out_msgs[1].message_content.decoded.comment
                await utils.invoice.invoice_achive(
                    id,
                    hash.toLowerCase(),
                    sender,
                    reciver,
                    senderFee,
                    routerFee,
                    0,
                    0,
                    0,
                    )
            }
        }
    }catch(e)
    {console.error(e)}

}


async function listen()
{
    var WebSocketClient = require('websocket').client;

    var client = new WebSocketClient();

    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function(connection) {
        console.log('Tonview websocket connected ');
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
            process.exit(0)
        });
        connection.on('close', function() {
            console.log('Connection Closed');
            process.exit(0)
        });
        connection.on('message',async function(message) {
            try{
                if (message.type === 'utf8') {
                    const msg = JSON.parse(message.utf8Data);
                    console.log(msg)
                    if(msg.method == 'subscribe_account')
                    {
                        console.log('Tonview websocket subscrib connected')
                    }
                    if(msg.method == 'trace')
                    {
                        await achive(msg.params.hash)
                    }
                    if(msg.method == 'account_transaction')
                    {
                        await achive(msg.params.tx_hash)
                    }
                }
            }catch(e)
            {
                console.error(e)
            }

        });

        connection.sendUTF(
            JSON.stringify(
                {
                    "id":1,
                    "jsonrpc":"2.0",
                    "method":"subscribe_account",
                    "params":[
                        process.env.LISTEN_TON_ID
                    ]
                }
            )
        )
        
        
    });

    client.connect(tonapiWs);
    }



// ws()

module.exports = {
    listen
}
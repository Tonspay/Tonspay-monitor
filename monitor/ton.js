
const grp  = require('graphql-request')

const tonweb = require("tonweb")

const endpoint = 'https://dton.io/graphql/'

const utils = require("../utils/index")

require('dotenv').config()

const tonapiWs = `wss://tonapi.io/v2/websocket?token=${process.env.TONVIWER_API}`

var lastInvoiceHash = [];

function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}
// test()

async function dtonLoopCheck()
{
    while(true)
        {
            try{
                await dtonLoopCore();
            }catch(e){
                console.error(e)
            }
            await sleep(10000)
        }
}

async function dtonLoopCore()
{
    var ret_txs = []
    var txs = await getTonTransactions(process.env.LISTEN_TON,10);
    txs = txs.transactions;
    // console.log(txs)
    txs.forEach(e => {
        ret_txs.push(e.hash);
    });

    var unDealHash = JSON.parse(JSON.stringify(ret_txs))
    for(var i  = 0 ; i < lastInvoiceHash.length ; i ++)
        {
            for(var u=0;u<ret_txs.length;u++)
                {
                    if(lastInvoiceHash[i]==ret_txs[u])
                        {
                            var index = unDealHash.indexOf(ret_txs[u]);
                            if (index !== -1) {
                                unDealHash.splice(index, 1);
                            }
                        }
                }
        }
    
    //Let's deal with the undeal txs
    for(var i = 0 ; i < unDealHash.length ; i ++)
        {
            await achive(unDealHash[i].toLowerCase())
        }

    lastInvoiceHash = JSON.parse(JSON.stringify(ret_txs))
    return lastInvoiceHash
}

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
        }else{
            if(i<10)
            {
                return await getTonMotherTransactionByChild(hash,i++)
            }
        }
    }catch(e)
    {console.error(e)}
    if(i<10)
    {
        return await getTonMotherTransactionByChild(hash,i++)
    }
    return false;
}

async function getTonSenderLastTxn(hash,i)
{
    try{
        const child =  await utils.api.getTonTransactionByHash(hash)
        // console.log(child);

        if(child && child.in_msg && child.in_msg.source)
        {
            var dst = child.in_msg.source.address
            const father = await utils.api.getTonTransactionByAccount(dst,2)
            // console.log(father.transactions[1].out_msgs)
            if(father && father?.transactions&&father.transactions.length>0)
            {
                
                for(var i = 0 ; i< father.transactions.length ; i ++)
                {
                    if(father.transactions[i].out_msgs.length >1)
                    {
                        return {
                            tx :  father.transactions[i]
                        }
                    }
                }
                return {
                    tx : father.transactions[0]
                }
            }else{
                if(i<10)
                {
                    await sleep(5000)
                    return await getTonSenderLastTxn(hash,i++)
                }
            }
        }else if(child && child.out_msgs && child.out_msgs.length==2)
        {
            return {
                tx : child,
            }
        }
        else{
            if(i<10)
            {
                await sleep(5000)
                return await getTonSenderLastTxn(hash,i++)
            }
        }
    }catch(e)
    {console.error(e)}

    if(i<10)
    {
        return await getTonSenderLastTxn(hash,i++)
    }
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
            var token = 0;
            const rawTx =  await getTonSenderLastTxn(hash.toLowerCase(),0);
            const tx =rawTx.tx;
            console.log(tx)
            // console.log(rawTx)
            if(tx && tx?.out_msgs && tx.out_msgs.length == 2)
            {
                var noticeTx ;
                var payTx ; 
                tx.out_msgs.forEach(ele => {
                    if(ele.decoded_op_name == "text_comment")
                    {
                        noticeTx = ele
                    }else{
                        payTx = ele
                    }
                });


                console.log(noticeTx)
                var sender =payTx.source.address;
                var senderFee = payTx.value
                var reciver =payTx.destination.address; 
                var router =noticeTx.destination.address;
                var routerFee = noticeTx.value
                var id = noticeTx.decoded_body.text

                if(payTx?.decoded_op_name && payTx.decoded_op_name == 'jetton_transfer' && payTx?.decoded_body)
                {
                    reciver = payTx.decoded_body.destination;
                    senderFee = payTx.decoded_body.amount
                    //Check if the jetton correct
                    const jetton = await utils.api.getTonWalletData(payTx.destination.address)
                    if(jetton?.decoded)
                    {
                        var _t = utils.invoice.getTonAddressToken(jetton.decoded.jetton);
                        if(_t)
                        {
                            token = _t
                        }
                    }
                }
                
                return await utils.invoice.invoice_achive(
                    id,
                    hash.toLowerCase(),
                    sender,
                    reciver,
                    Number(senderFee),
                    routerFee,
                    0,
                    token,
                    tx.utime,
                    )
            }
        }
    }catch(e)
    {console.error(e)}

}


async function listen()
{
    // var WebSocketClient = require('websocket').client;

    // var client = new WebSocketClient();

    // client.on('connectFailed', function(error) {
    //     console.log('Connect Error: ' + error.toString());
    // });

    // client.on('connect', function(connection) {
    //     console.log('Tonview websocket connected ');
    //     connection.on('error', function(error) {
    //         console.log("Connection Error: " + error.toString());
    //         process.exit(0)
    //     });
    //     connection.on('close', function() {
    //         console.log('Connection Closed');
    //         process.exit(0)
    //     });
    //     connection.on('message',async function(message) {
    //         try{
    //             if (message.type === 'utf8') {
    //                 const msg = JSON.parse(message.utf8Data);
    //                 console.log(msg)
    //                 if(msg.method == 'subscribe_account')
    //                 {
    //                     console.log('Tonview websocket subscrib connected')
    //                 }
    //                 if(msg.method == 'trace')
    //                 {
    //                     await achive(msg.params.hash)
    //                 }
    //                 if(msg.method == 'account_transaction')
    //                 {
    //                     await achive(msg.params.tx_hash)
    //                 }
    //             }
    //         }catch(e)
    //         {
    //             console.error(e)
    //         }

    //     });

    //     connection.sendUTF(
    //         JSON.stringify(
    //             {
    //                 "id":1,
    //                 "jsonrpc":"2.0",
    //                 "method":"subscribe_account",
    //                 "params":[
    //                     process.env.LISTEN_TON_ID
    //                 ]
    //             }
    //         )
    //     )
        
        
    // });

    // client.connect(tonapiWs);
    await dtonLoopCheck()

}



// ws()

module.exports = {
    listen,
    achive,
    getTonSenderLastTxn,
    getTonTransactions,
    
}
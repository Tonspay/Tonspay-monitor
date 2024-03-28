const orb = require("@orbs-network/ton-access");
const ton = require('@ton/ton')

const grp  = require('graphql-request')

const tonweb = require("tonweb")

const endpoint = 'https://dton.io/graphql/'

const utils = require("../utils/index")

require('dotenv').config()

var lastInvoiceHash = "61E6899179EF660D6BCE0B99BC7FB9A3E7415769C16C1D9502CD023A2A3E305E";

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

async function checkNewTxn()
{
    const tx = await getTonLastHash(process.env.LISTEN_TON,1);
    if(tx && tx?.transactions && tx.transactions.length > 0 &&tx.transactions[0].hash != lastInvoiceHash)
    {
        return false;//No new invoice
    }
    return true;
}

async function listen()
{
    // if(await checkNewTxn())
    // {
    //     return false;
    // }
    // await sleep(10000);
    const txs = (await getTonTransactions(process.env.LISTEN_TON,100))?.transactions
    //Verify if new txn & txn
    if(txs && txs[0].hash != lastInvoiceHash && checkIsReachPageLimit(txs))
    {
        console.log(txs[0].in_msg_body)
        for(var i = 0 ; i<txs.length ; i++)
        {
            const ele = txs[i];
            const id = tryDecodeMsg(ele);
            if(id)
            {
                // console.log(ele);
                // console.log(id)
                //TODO check if the txn valid . 
                const tx = await getTonTransactionByHash(ele.hash.toLowerCase());
                console.log(tx)
                if(tx && tx?.out_msgs && tx.out_msgs.length == 2)
                {
                    const sender = tx.out_msgs[0].source.address;
                    const senderFee = tx.out_msgs[0].value
                    const reciver = tx.out_msgs[0].destination.address;
                    const router = tx.out_msgs[1].destination.address;
                    const routerFee = tx.out_msgs[1].value

                    console.log(
                        id,
                        ele.hash.toLowerCase(),
                        sender.toBase58().toLowerCase(),
                        reciver.toBase58().toLowerCase(),
                        senderFee,
                        routerFee,
                        0,
                        0,
                        0
                    )
                    // await utils.invoice.invoice_achive(
                    //     id,
                    //     ele.hash.toLowerCase(),
                    //     sender.toBase58().toLowerCase(),
                    //     reciver.toBase58().toLowerCase(),
                    //     senderFee,
                    //     routerFee,
                    //     0,
                    //     0,
                    //     0
                    //     )
                }
                await sleep(1000)
            }
        }
    
        return false;
    }
}

function tryDecodeMsg(transaction)
{
    try{
        const bs = tonweb.boc.Cell.fromBoc(Buffer.from(transaction.in_msg_body,'base64').toString('hex'))
        return Buffer.from(bs[0].bits.toHex(),"hex").toString(); 
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

async function test()
{
    // // get the decentralized RPC endpoint
    // const endpoint = await orb.getHttpEndpoint(); 
    // // initialize ton library
    // const client = new ton.TonClient({ endpoint });
    // console.log(client)

    const tx = await getTonTransactionByHash('')

    console.log(tx)
}

// test()

listen()
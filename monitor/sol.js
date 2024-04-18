

const web3 = require("@solana/web3.js")
const utils = require("../utils/index")
var solanaConnection ;

var LISTEN_SOL ;

function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

async function init(SOL_HTTP,SOL_WS,LISTEN)
{
    solanaConnection = new web3.Connection(SOL_HTTP,{wsEndpoint:SOL_WS})
    LISTEN_SOL = LISTEN
    return 0;
}

async function listen()
{
    const ACCOUNT_TO_WATCH = new web3.PublicKey(process.env.LISTEN_SOL); // Replace with your own Wallet Address
    await solanaConnection.onLogs(
        ACCOUNT_TO_WATCH,
        async (updatedAccountInfo) =>
        {try{console.log(updatedAccountInfo);await handle(updatedAccountInfo)}catch(e){console.error(e)}},
        // setTimeout(() => {try{handle(updatedAccountInfo)}catch(e){console.error(e)}}, 60000),
        "confirmed"
    );
    console.log('🚀 SOLANA process monit start');
}


async function awaitSignatureStatus(sign,i)
{
    const ret = await solanaConnection.getSignatureStatus(sign, {searchTransactionHistory:true});
    console.log(ret)
    if(ret?.value?.confirmationStatus == 'finalized')
    {
        return true;
    }
    if(i>=120)
    {
        return false;
    }
    await sleep(1000);
    return await awaitSignatureStatus(sign,i++)
}

async function handle(updatedAccountInfo)
{
    await awaitSignatureStatus(updatedAccountInfo.signature,0)
    let transactionDetails = await solanaConnection.getParsedTransaction(updatedAccountInfo.signature, {maxSupportedTransactionVersion:0});
    if(transactionDetails && transactionDetails?.transaction)
    {
        const memo = get_memo(transactionDetails.transaction)
        console.log(memo);
        //Verfiy the tranasction direction & no tirck
        const sender = transactionDetails.transaction.message.accountKeys[0]?.pubkey;
        const balSender = transactionDetails.meta.postBalances[0]-transactionDetails.meta.preBalances[0]
        const reciver = transactionDetails.transaction.message.accountKeys[1]?.pubkey
        const balReciver = transactionDetails.meta.postBalances[1]-transactionDetails.meta.preBalances[1]
        const router = transactionDetails.transaction.message.accountKeys[2]?.pubkey
        const balRouter = transactionDetails.meta.postBalances[2]-transactionDetails.meta.preBalances[2]
        await utils.invoice.invoice_achive(
            memo,
            updatedAccountInfo.signature.toLowerCase(),
            sender.toBase58().toLowerCase(),
            reciver.toBase58().toLowerCase(),
            balReciver,
            balRouter,
            1,
            0,
            0
            )
    }
}

function get_memo(transaction)
{
    var ret = false;
    if(transaction?.message?.instructions)
    {
        transaction.message.instructions.forEach(ele => {
            const diff = new web3.PublicKey(ele.programId).toBase58() === new web3.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr').toBase58();
            
            if(diff&& ele?.parsed)
            {
                ret = ele?.parsed;
            }
        });
    }
    return ret
}

module.exports = {
    init,
    listen,
    handle
}
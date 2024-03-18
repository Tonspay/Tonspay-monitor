

const web3 = require("@solana/web3.js")
const utils = require("../utils/index")
var solanaConnection ;

async function init(SOL_HTTP,SOL_WS,LISTEN_SOL)
{
    solanaConnection = new web3.Connection(SOL_HTTP,{wsEndpoint:SOL_WS})
    await listen(LISTEN_SOL);
}

async function listen(LISTEN_SOL)
{
    const ACCOUNT_TO_WATCH = new web3.PublicKey(process.env.LISTEN_SOL); // Replace with your own Wallet Address
    const subscriptionId = await solanaConnection.onLogs(
        ACCOUNT_TO_WATCH,
        async (updatedAccountInfo) =>
        setTimeout(() => {try{handle(updatedAccountInfo)}catch(e){console.error(e)}}, 60000),
        "confirmed"
    );
    console.log('Starting web socket, subscription ID: ', subscriptionId);
}

async function handle(updatedAccountInfo)
{
    await solanaConnection.confirmTransaction(updatedAccountInfo.signature);
    let transactionDetails = await solanaConnection.getParsedTransaction(updatedAccountInfo.signature, {maxSupportedTransactionVersion:0});
    if(transactionDetails && transactionDetails?.transaction)
    {
        const memo = getMemo(transactionDetails.transaction)

        console.log(memo);
    }
}

function getMemo(transaction)
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
    listen
}
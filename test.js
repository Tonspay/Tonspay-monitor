const web3 = require("@solana/web3.js")

const sol = require("./monitor/sol")
const ton = require("./monitor/ton")
const api =require("./utils/apis")
const solanaConnection = new web3.Connection(process.env.SOL_HTTP,{wsEndpoint:process.env.SOL_WS});
const utils = require("./utils/index");

const b58 = require("b58")
const nacl = require("tweetnacl")
async function listenAccount()
{
    const ACCOUNT_TO_WATCH = new web3.PublicKey(''); // Replace with your own Wallet Address
    const subscriptionId = await solanaConnection.onAccountChange(
        ACCOUNT_TO_WATCH,
        (updatedAccountInfo) =>
            console.log(`---Event Notification for ${ACCOUNT_TO_WATCH.toString()}--- \nNew Account Balance:`, updatedAccountInfo.lamports / web3.LAMPORTS_PER_SOL, ' SOL'),
        "confirmed"
    );
    console.log('Starting web socket, subscription ID: ', subscriptionId);
}

async function getTransactions(address, numTx) {
    const pubKey = new web3.PublicKey(address);
    let transactionList = await solanaConnection.getSignaturesForAddress(pubKey, {limit:numTx});

    let signatureList = transactionList.map(transaction=>transaction.signature);
    let transactionDetails = await solanaConnection.getParsedTransactions(signatureList, {maxSupportedTransactionVersion:0});

    transactionList.forEach((transaction, i) => {
        const date = new Date(transaction.blockTime*1000);
        const transactionInstructions = transactionDetails[i].transaction.message.instructions;
        console.log(`Transaction No: ${i+1}`);
        console.log(`Signature: ${transaction.signature}`);
        console.log(`Time: ${date}`);
        console.log(`Status: ${transaction.confirmationStatus}`);
        transactionInstructions.forEach((instruction, n)=>{
            console.log(`---Instructions ${n+1}: ${instruction.programId.toString()}`);
        })
        console.log(("-").repeat(20));
    })
}


async function fetchMemo() {
    const wallet = new web3.PublicKey('');
    let signatureDetail = await solanaConnection.getSignaturesForAddress(wallet,{limit:1});
    console.log(signatureDetail)
    let transactionDetails = await solanaConnection.getTransaction(signatureDetail[0].signature)
    console.log(JSON.stringify(transactionDetails))
    console.log(transactionDetails.meta.transaction)
    // const signatureDetails = await solanaConnection.getSignatureStatus("KsGQTzH2LaEoyr3zgp91bjfeU1D2Q4yjBFPZnvZmsQqiuJa3ht6u6oaomFUVAgonEv6dsUgxiKbvoJMZDW39g19")
    // console.log(signatureDetails)
    // console.log('Fetched Memo: ', signatureDetail[0].memo);
}

async function getRawTx()
{
    let transactionDetails = await solanaConnection.getParsedTransaction('', {maxSupportedTransactionVersion:0});
    // console.log(JSON.stringify(transactionDetails))
    console.log(
        getMemo(transactionDetails.transaction)
    )
}


function getMemo(transaction)
{
    var ret = false;
    if(transaction?.message?.instructions)
    {
        transaction.message.instructions.forEach(ele => {
            console.log(ele)
            const diff = new web3.PublicKey(ele.programId).toBase58() === new web3.PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr').toBase58();
            
            if(diff&& ele?.parsed)
            {
                ret = ele?.parsed;
            }
        });
    }
    return ret
}

async function callbacktest()
{
    await sol.init(process.env.SOL_HTTP,process.env.SOL_WS,process.env.LISTEN_SOL);
    const preTx = '';
    await sol.handle({signature:preTx})

}

async function evmListenTest()
{
    // await utils.web3.init(false,'tbsc')
    // await utils.web3.listen();
    await utils.web3.init(true,'tbsc')
    const ret = await utils.web3.payAnalyzeByHash('0xaff36f3c1ffcbd87bec9eb05d7942df57f7fe9280497de51b1bdd6499659a6ad')
    console.log(ret)
}

function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
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

async function tonApiTest()
{
    var testhash = ''
    const data = await api.getTonTransactionByHash(testhash);
    console.log(data);
    // console.log(data.transactions[0].in_msg)
    // console.log(data.transactions[0].in_msg.hash)
    var dst = data.in_msg.source.address//(data.transactions[0].in_msg.source.split(":"))[1]
    const msgTx = await api.getTonTransactionByAccount(dst,1)
    // const msgTx = await api.getToncenterTransactionByMessage('out',data.transactions[0].in_msg.hash)
    // const msgTx = await api.getTonTransactionByMessage(data.transactions[0].in_msg.hash)
    console.log(msgTx.transactions[0])
}

async function generateNewkp()
{
    const kp= nacl.sign.keyPair();

    console.log(
        b58.encode(kp.secretKey)
    )
    console.log(
        b58.encode(kp.publicKey)
    )
}

async function tonTest()
{
    // const tx = await api.getTonTransactionByHash('')
    // const txs = await ton.getTonSenderLastTxn("",5)
    // console.log(txs.tx.out_msgs[0])
    // const jetton = await api.getTonWalletData(txs.tx.out_msgs[0].destination.address)
    // console.log(jetton)
    await ton.achive('')
}

async function test()
{
    // await getTransactions('')
    // await fetchMemo()
    // await getRawTx()
    // await callbacktest()
    // await evmListenTest()

    // await awaitSignatureStatus('')
    // console.log("Test over")

    // await tonApiTest()
    // await generateNewkp()

    await tonTest()
}

test()
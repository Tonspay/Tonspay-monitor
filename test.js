const web3 = require("@solana/web3.js")


const solanaConnection = new web3.Connection(process.env.SOL_HTTP,{wsEndpoint:process.env.SOL_WS});


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
async function test()
{
    // await getTransactions('')
    // await fetchMemo()
    await getRawTx()
}

test()
const req = require("./request");

require('dotenv').config()

const tonviewUrl = 'https://tonapi.io/'

const tonRouter = {
    transactions: tonviewUrl + 'v2/blockchain/transactions/',
    messages: tonviewUrl + 'v2/blockchain/messages/',
    account: tonviewUrl + 'v2/blockchain/accounts/'
}

const toncenterUrl = `https://toncenter.com/api/`;

const toncenterRouter = {
    getTransactionByHash: toncenterUrl + `v3/transactions`,
    getTransactionByMessage: toncenterUrl + `v3/transactionsByMessage`
}

async function anyRequest(url) {
    var options = {
        'method': 'GET',
        'url': url,
        'headers': {
            'user-agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
            'Content-Type': 'application/json'
        },
    };
    return req.doRequest(options);
}

async function callbackRequest(callback, body) {
    var options = {
        'method': 'POST',
        'url': callback,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(body)
    };
    return req.doRequest(options);
}

async function getTonTransactionByHash(hash) {
    var options = {
        'method': 'GET',
        'url': tonRouter.transactions + hash,
        'headers': {
            'Authorization': "Bearer " + process.env.TONVIWER_API,
            'Content-Type': 'application/json'
        },
    };
    return req.doRequest(options);
}

async function getTonTransactionByMessage(hash) {
    var options = {
        'method': 'GET',
        'url': tonRouter.messages + hash+'/transaction',
        'headers': {
            'Authorization': "Bearer " + process.env.TONVIWER_API,
            'Content-Type': 'application/json'
        },
    };
    return req.doRequest(options);
}

async function getTonTransactionByAccount(account,limit) {
    var options = {
        'method': 'GET',
        'url': tonRouter.account + account+'/transactions?limit='+limit,
        'headers': {
            'Authorization': "Bearer " + process.env.TONVIWER_API,
            'Content-Type': 'application/json'
        },
    };
    return req.doRequest(options);
}

async function getTonWalletData(account)
{
    var options = {
        'method': 'GET',
        'url': tonRouter.account + account+'/methods/get_wallet_data',
        'headers': {
            'Authorization': "Bearer " + process.env.TONVIWER_API,
            'Content-Type': 'application/json'
        },
    };
    return req.doRequest(options);
}

async function getToncenterTransactionByHash(hash) {
    var options = {
        'method': 'GET',
        'url': toncenterRouter.getTransactionByHash + "?hash=" + hash,
        'headers': {
            'X-API-Key': process.env.TONCENTER_API,
            'Content-Type': 'application/json'
        },
    };

    return req.doRequest(options);
}

async function getToncenterTransactionByMessage(dir, hash) {
    var options = {
        'method': 'GET',
        'url': toncenterRouter.getTransactionByMessage + `?direction=${dir}&msg_hash=${encodeURI(hash)}`,
        'headers': {
            'X-API-Key': process.env.TONCENTER_API,
            'Content-Type': 'application/json'
        },
    };
    return req.doRequest(options);
}


module.exports = {
    anyRequest,
    callbackRequest,
    getTonTransactionByHash,
    getTonTransactionByMessage,
    getTonTransactionByAccount,
    getToncenterTransactionByHash,
    getToncenterTransactionByMessage,
    getTonWalletData
}
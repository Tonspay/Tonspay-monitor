const Web3 = require('web3')
const config = require("../config.json")
const invoice = require("./invoice")
require('dotenv').config()
var BigNumber = require("bignumber.js")
var web3 //= new Web3(new Web3.providers.HttpProvider(config.bsc.httpProvider[0]))

var chain

var invoice_chain_information
/**
 * 🔥 Init it.
 */
async function init(type,_chain)
{
  chain = _chain
  if(type){
    web3 = new Web3(new Web3.providers.HttpProvider(config[chain].httpProvider[0]))
  }else{
    web3 = new Web3(new Web3.providers.WebsocketProvider(config[chain].wsProvider[0]))
  }
  invoice_chain_information = config[chain].invoice;
}

/**
 * 📻 Listen to the transactions 
 */

async function listen()
{
  console.log("🔥 EVM process listen")
  var options = {
    address: invoice_chain_information.routerAddress,
      topics: [
        invoice_chain_information.topics.pay,
      ]
    };
  await web3.eth.subscribe('logs', options, function(error, result){
      if (!error) console.log('got result',result);
      else console.log(error);
  }).on("data", async function(log){
    console.log("on data")
    try{await handle(log)}catch(e){console.error(e)}
    // setTimeout(() => {try{handle(log)}catch(e){console.error(e)}}, 60000)
  }).on("changed", function(log){
      console.log('changed',log);
  });
}

async function handle(log)
{
  const logs = await payAnalyzeByHash(log.transactionHash)
  if((log.topics[0]).toLowerCase() == invoice_chain_information.topics.pay.toLowerCase() &&logs )
  {
    //Pay events
    console.log(
      "🔥Pay event in evm",
      logs.id.toLowerCase(),
      log.transactionHash.toLowerCase(),
      logs.from.toLowerCase(),
      logs.to.toLowerCase(),
      logs.amount,
      logs.amountRouter,
      invoice_chain_information.invoice_type,
      0,
      log.blockNumber
    )
    await invoice.invoice_achive(
      logs.id.toLowerCase(),
      log.transactionHash.toLowerCase(),
      logs.from.toLowerCase(),
      logs.to.toLowerCase(),
      logs.amount,
      logs.amountRouter,
      invoice_chain_information.invoice_type,
      0,
      log.blockNumber
      )
  }
}

/**
 * 🚀Event check
 */
async function payAnalyzeByHash(hash)
{
    var lettry = 0 ;
    while(true)
    {
        var _w3 = web3
        var ret = await _w3.eth.getTransactionReceipt(hash);
        if(ret.logs)
        {
            try{
                const _abi = getRouterAbi();
                for(var i = 0 ; i < ret.logs.length ; i ++)
                {
                  //Pay event
                  if((ret.logs[i].topics[0]) && (ret.logs[i].topics[0]).toLowerCase() == '0x144288996e16900164b8e80321c7076aa5901873a8cfe494c8890d3f1c099e32'.toLowerCase())
                  {
                    var decode = await web3.eth.abi.decodeLog(_abi[1].inputs, ret.logs[i].data,  ret.logs[i].topics);
                    return decode;
                  }

                }
            }catch(e)
            {
              console.log(e)
            }
            return false;
        }else{
            if(lettry > 10)
            {
                return false;
            }
        }
        lettry++;
    }

}

function getRouterAbi()
{
    return [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "string",
            "name": "id",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "originFrom",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountFinal",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountRouter",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "isPrepaid",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "pay",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "string",
            "name": "id",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "originFrom",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountFinal",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amountRouter",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "isPrepaid",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "payToken",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "withdraw",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "time",
            "type": "uint256"
          }
        ],
        "name": "withdrawToken",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "routerRateDecimail",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "id",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "routerRate",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "id",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "routerRate",
            "type": "uint256"
          }
        ],
        "name": "transferToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "withdrawTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "withdraws",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
}

module.exports = {
  init,
  listen,
  payAnalyzeByHash
}
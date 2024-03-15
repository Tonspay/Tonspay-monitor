# Tonspay index monitor

This repo is to build the transaction monitor of **Tonspay** , Which able to monit the transactions onchain.

**Tonspay** monitor system including : 

- #### Invoices moniting
    - moniting transactions onchain
        - Verfiy invoice payment transactions
    - supporting chains :
        - TON
        - Solana
        - Arbitrum
        - Goerli
- #### Call back system
    - Invoice payment confirmed call back .
        - Https request
        - Wss boardcast

## Monitor logic 

Tonspay payment function working on different logic due to the chain states .

- #### SOLANA
    User pay invoice with 2 transactions : 
    
    - Payment transaction : 
        - Directly from `User account` into `Merchant account` on chain .
    - Notification transaction : 
        - From `User account` into `notification account` 
        - Transaction comment : `Invoice ID`
    
    Monitor logic : 
        
    - Monit the `notification account` for any transaction .  
    - Read the comment of transaction to find the invoice . 
    - Verfiy invoice payment transaction match require or not .

- #### TON

    Same as **SOLANA**

- ### Arbitrum (EVM chain)
    Deploy `invoice-payment-contract` to recive payment . 

    Contract including `transfer` & `transferErc20` function : 
    - Method : 
        - to . address
        - amount . uint256
        - token . address (option)
    - Contract logic
        - Recive token from `User account`
        - Culcuate `fee` & `pay_amount` from `amount`
        - Send to `to` address with `pay_amount`
        - Add a new `event` to record the invoice payment
    
    Monitor logic :

    - Listen to the `event` of invoice payment

## Callback logic :

Tonspay callback system support for both `http` & `websocket` . Merchant can set the callback path via [Bot](https://t.me/tonspay_bot) or [Restful](https://docs.tonspay.top/develop/restful-api-interface) . 

### Callback http request : 

- Method : `POST`
- Body :  ${body}

### Callback websocket :

- Pre-listen subscript request : 
    - Send in json 
    ```
    {
       "action" : "subscript",
       "merchanKey":"Your-merchant-api-kay" 
    }
    ```

- Payment callback : 
    - Recive in json :  ${body}
    
### Callback  ${body} :

The callback body will be sign by a keypair of Tonspay official to avoid callback interface being witch attack . 

**Body** : 
```
{
    sign : "The signature data to prove message sended from tonspay"
}
```

The `sign` are a signature that using `ed25519` . Result being encode by `base58` , please decode it into bytes by base58.

You will be able to deocde the signature-data by `tweetnacl` into data `${base64-data}`.

**Base64-data** decode with `json.parse`: 
```
{
           "uid":0, //Your merchant user id in telegram bot . Please verfiy if it is your callback.
            "invoiceId":"",//Which invoice this callback for . 
            "paymentMethod":"",//The payment method of the invoice . 
            "confirmedBlock":"", //How many block since the callback confirm . 
            "paymentDetails":{
                    "from":"",//The address of payer . 
                    "amount":0,//How much this transaction paid on chain .
                    "hash" : "",//The transaction hash of this payment . 
            },
            "routerFeeDetails":{
                    "from":"",//The address of payer . 
                    "amount":"",//How much being charged by payment router .
                    "hash" : "" , //The sub transaction of router fee .
                    "isPrepaid":bool, //If this transaction being prepaird by merchant by Token . 
            },
            "createTime":0//The time of this callback .
},
```

Tonspay signature **publick-key** :
```
ENzsJ58Lmb6GMfMPhsTKm1AYaEoL5Z24r9RVPKaYLyJ6
``` 

**Verfiy logic in js** : 

```
const signData = b58.decode(rawData.sign);

const decodeData = nacl.sign.open( signData, b58.decode('ENzsJ58Lmb6GMfMPhsTKm1AYaEoL5Z24r9RVPKaYLyJ6'))

const finalData = json.parse(
    Buffer.from(decodeData).toString()
)
```


## How to run the tonspay monitor :

- Get ready of `DB` & `npm`

- `npm install`

- `npm run monitor`
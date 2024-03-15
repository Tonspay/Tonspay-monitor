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

## How tonspay monitor works 

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

## How to run the tonspay monitor :

- Get ready of `DB` & `npm`

- `npm install`

- `npm run monitor`
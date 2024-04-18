# Tonspay index monitor http-requester

This repo is to build the requester of Tonspay monitor

The Tonspay-monitor now working in logic  :

- Tonspay-monitor-server . listen in ${ip:port}

- Tonspay-monitor-requester . listen blockchains 
    - Send out `emit` request when blockchains emit any new actions or transactions .

**Tonspay** monitor system including : 

## supporting chains & tokens

- TON
    - TON

- EVM
    - BSC
        - BNB
    - ARB
        - ETH
    - TBSC
        - TBNB

- SOLANA
    - SOL
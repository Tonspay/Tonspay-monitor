const sol = require("./monitor/sol")

require('dotenv').config()

async function init()
{
    await sol.init(process.env.SOL_HTTP,process.env.SOL_WS,process.env.LISTEN_SOL)
    await sol.listen();
    
}

init()
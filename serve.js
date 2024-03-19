const modules = require("./modules/index")

const sol = require("./monitor/sol")

const tbsc = require("./monitor/tbsc");

require('dotenv').config()

function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}


async function init()
{
    await tbsc.init()
    tbsc.listen();

    await sol.init(process.env.SOL_HTTP,process.env.SOL_WS,process.env.LISTEN_SOL)
    sol.listen();
    
    await sleep(0)
}

init()
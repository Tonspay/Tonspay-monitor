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
    // console.log(process.env.SOL_HTTP,process.env.SOL_WS,process.env.LISTEN_SOL)
    // await sol.init(process.env.SOL_HTTP,process.env.SOL_WS,process.env.LISTEN_SOL)
    // sol.listen();

    await tbsc.init()
    tbsc.listen();
    await sleep(0)
}

init()
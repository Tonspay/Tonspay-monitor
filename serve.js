const modules = require("./modules/index")

const sol = require("./monitor/sol")

require('dotenv').config()

function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}


async function init()
{
    // console.log(process.env.SOL_HTTP,process.env.SOL_WS,process.env.LISTEN_SOL)
    sol.init(process.env.SOL_HTTP,process.env.SOL_WS,process.env.LISTEN_SOL)
    await sleep(0)
}

init()
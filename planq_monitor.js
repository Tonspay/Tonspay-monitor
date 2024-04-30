const planq = require("./monitor/planq");

require('dotenv').config()

function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

async function init()
{
    while(true)
    {
        try
        {
            await planq.init()
            await planq.listen();
            console.log("Planq Websocket new connect")
            await sleep('300000')
        }catch(e)
        {
            console.error(e)
        }
    }
}

init()
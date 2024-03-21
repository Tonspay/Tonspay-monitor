const arb = require("./monitor/arb");

require('dotenv').config()


async function init()
{
    try
    {
        await arb.init()
        await arb.listen();
    }catch(e)
    {
        console.error(e)
    }

}

init()
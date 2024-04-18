const bsc = require("./monitor/bsc");

require('dotenv').config()


async function init()
{
    try
    {
        await bsc.init()
        await bsc.listen();
    }catch(e)
    {
        console.error(e)
    }

}

init()
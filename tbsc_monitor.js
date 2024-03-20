const tbsc = require("./monitor/tbsc");

require('dotenv').config()


async function init()
{
    try
    {
        await tbsc.init()
        await tbsc.listen();
    }catch(e)
    {
        console.error(e)
    }

}

init()
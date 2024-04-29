const planq = require("./monitor/planq");

require('dotenv').config()


async function init()
{
    try
    {
        await planq.init()
        await planq.listen();
    }catch(e)
    {
        console.error(e)
    }

}

init()
const zkscroll = require("./monitor/zkscroll");

require('dotenv').config()


async function init()
{
    try
    {
        await zkscroll.init()
        await zkscroll.listen();
    }catch(e)
    {
        console.error(e)
    }

}

init()
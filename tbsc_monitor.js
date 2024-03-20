const tbsc = require("./monitor/tbsc");

require('dotenv').config()


async function init()
{
    await tbsc.init()
    tbsc.listen();
}

init()
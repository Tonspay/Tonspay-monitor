const utils = require("../utils/index");

function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}


async function init()
{
    await utils.web3.init(false,"zkscroll")
    return 0;
}

async function listen()
{
    await utils.web3.listen();
}

module.exports = {
    init,
    listen
}
const utils = require("../utils/index");
async function init()
{
    await utils.web3.init(false,"tbsc")
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
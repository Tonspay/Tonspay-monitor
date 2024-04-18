const ton = require("./monitor/ton")

async function init() {
    await ton.listen();

}

init()
const ton = require("./monitor/ton");
const nacl = require("tweetnacl")
const b58 = require("b58")
require('dotenv').config()
async function test()
{
    var achive = await ton.achive('')
    console.log(achive)
}

test()
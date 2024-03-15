const req = require("./request");

async function anyRequest(url)
{
    var options = {
        'method': 'GET',
        'url': url,
        'headers': {
          'user-agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
          'Content-Type': 'application/json'
        },
      };
      return req.doRequest(options);
}

async function callbackRequest(callback,body)
{
    var options = {
        'method': 'POST',
        'url': callback,
        'headers': {
          'Content-Type': 'application/json'
        },
        'body':JSON.stringify(body)
      };
      return req.doRequest(options);
}
module.exports = {
    anyRequest,
    callbackRequest
}
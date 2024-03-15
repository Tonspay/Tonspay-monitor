const request = require('request');
async function doRequest(options)
{
    return new Promise(function (resolve, reject) {
        request(options, function (error, response) {
            if (error) throw new Error(error);
            rawData = JSON.parse(response.body);
            resolve(rawData);
        });
      });
}

module.exports = {
    doRequest,
}

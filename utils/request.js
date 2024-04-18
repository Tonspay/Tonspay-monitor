const request = require('request');
async function doRequest(options)
{
    return new Promise(function (resolve, reject) {
        request(options, function (error, response) {
            if (error) throw new Error(error);
            rawData = false;
            try{
                rawData = JSON.parse(response.body);
            }catch(e)
            {
                console.error(e)
            }
            resolve(rawData);
        });
      });
}

module.exports = {
    doRequest,
}

require('dotenv').config()

const authToken=  process.env.HTTP_AUTH

async function auth(req, res, next) {
  const token = req.headers.token;
  if (token == authToken) {
    next();
  } else {
    res.status(401).send({
        code:401,
        error:"Permission deny . Please check if API-KEY correct ."
    });
  }
}

exports.auth = auth;

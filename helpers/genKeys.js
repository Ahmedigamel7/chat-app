const crypto = require("crypto");
const util = require('util');

const randomBytesAsync = util.promisify(crypto.randomBytes);

exports.gen_token = async()=> {
  try {
    const randomBytes = await randomBytesAsync(32);
    return randomBytes.toString('hex');
  } catch (error) {
    throw error
  }
}




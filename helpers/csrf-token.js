const jwt = require('jsonwebtoken');
const util = require('util');

const sign = util.promisify(jwt.sign);

const verify = util.promisify(jwt.verify);

const CSRF_TOKEN = process.env.CSRF_TOKEN;
const RESET_SCERET = process.env.RESET_SCERET;

const sign_CSRF_token = async () => {
    try {
        const payload = { data: CSRF_TOKEN, exp: Math.floor(Date.now() / 1000) + (60 * 60) };
        const csrf = await sign(payload, RESET_SCERET, { expiresIn });
        return csrf;
    } catch (error) {
        throw error;
    }
}

const verfiy_CSRF_token = async (token) => {
    try {
        const data = await verify(token);
        if (data !== undefined)
            return true;
        else throw new Error('undefined CSRF TOKEN');

    } catch (error) {
       throw error;
    }
}
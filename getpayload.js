const jwt = require('jsonwebtoken');


function getpayload(token){

    try {
        // Decode the token
        const decoded = jwt.decode(token);
        return decoded
    } catch (error) {
        // Something went wrong
        console.error('Error decoding token:', error.message);
        return {"error":error.message}
    }

}

module.exports = getpayload

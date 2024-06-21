const jwt = require('jsonwebtoken');
require('dotenv').config();

async function authenticateUserToken(req, res, next) {
    const tokenHeader = req.headers.authorization; // Get the token from the request header (adjust as needed)
    
    if (!tokenHeader || !tokenHeader.startsWith('UserLoginToken ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = tokenHeader.slice(15); // Remove 'UserLoginToken ' prefix

    try {
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET); // Pass your actual secret key
        // You can access the decoded token here
        console.log('Decoded token:', decodedToken);

        req.user = {
            email: decodedToken.email,
        };

        next();
    } catch (err) {
        console.error(err);
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
}

module.exports = authenticateUserToken;

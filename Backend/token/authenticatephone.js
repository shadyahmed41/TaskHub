const jwt = require('jsonwebtoken');
require('dotenv').config();

async function authenticatephone(req, res, next) {
    const tokenHeader = req.headers.authorization; // Get the token from the request header (adjust as needed)
    // console.log(tokenHeader)
    if (!tokenHeader) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Check if the token starts with 'Bearer '
    if (tokenHeader.startsWith('Bearer ')) {
        // Remove 'Bearer ' prefix
        const token = tokenHeader.slice(7);

        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
            // console.log('Decoded token:', decodedToken);

            if (err) {
                console.error(err);
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            // Check if the user has an OTP in the session
            
            req.user = {
                phone: decodedToken.phone,
                OTP: decodedToken.OTP, // Use the stored OTP or generate a new one
                wrongAttempts: decodedToken.wrongAttempts || 0, // Include wrong attempts information
            };

            // console.log('User OTP:', userOTP);

            next();
        });
    } else {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
}

module.exports = authenticatephone;

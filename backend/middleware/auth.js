const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).send({ message: 'Unauthorized' });
        }

        jwt.verify(token, 'secret_key', (err, user) => {
            if (err) {
                return res.status(403).send({ message: 'Forbidden' });
            }
            if (roles.length && !roles.includes(user.role)) {
                return res.status(403).send({ message: 'Forbidden' });
            }
            req.user = user;
            next();
        });
    };
};

module.exports = auth; 
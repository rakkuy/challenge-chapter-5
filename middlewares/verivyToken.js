const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader?.split(' ')[1];
  // return res.json({ token });
  // console.log(token);
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized', data: null });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: err.message, data: null });

    req.user = user;
    next();
  });
};

module.exports = { verifyToken };

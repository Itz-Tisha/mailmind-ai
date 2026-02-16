const jwt = require('jsonwebtoken');


//when user sign in then its token become = payload of that user + jwt secret (which is stored in .env file)
module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired' });
  }
};
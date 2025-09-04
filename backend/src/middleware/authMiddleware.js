const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach user information to the request object
    req.user = decoded;
    next(); // Proceed to the next middleware or the route handler
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
  }
}

module.exports = authMiddleware;
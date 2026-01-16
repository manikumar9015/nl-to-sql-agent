const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  // Get the token from the Authorization header OR query parameter (for SSE)
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    // Allow token in query parameter for EventSource/SSE
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  const decoded_token = token; // Keep for verification below

  try {
   // Verify the token
    const decoded = jwt.verify(decoded_token, JWT_SECRET);
    // Attach user information to the request object
    req.user = decoded;
    next(); // Proceed to the next middleware or the route handler
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
  }
}

module.exports = authMiddleware;
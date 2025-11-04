const jwt = require("jsonwebtoken");

// Middleware to check JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Standardize payload
    req.user = {
      userId: decoded.id || decoded.userId, // your token should have id
      role: decoded.role,
      orgId: decoded.orgId || null,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

// Middleware to authorize specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

module.exports = { authMiddleware, authorizeRoles };

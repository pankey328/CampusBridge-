const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found. Token invalid." });
      }

      next();
    } catch (error) {
      console.error("JWT Verification Failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

// Authorization (RBAC)
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user.role}) is not authorized to access this resource`
      });
    }
    next();
  };
};

const crypto = require("crypto");

// Generates random secure token with hashed version
exports.generateActivationToken = () => {

  const rawToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const tokenExpires = Date.now() + 24 * 60 * 60 * 1000;

  return { rawToken, tokenHash, tokenExpires };
};

// Verifies if incoming raw token matches the saved hash
exports.verifyToken = (rawToken, savedHash) => {
  const hashToCompare = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
    
  return hashToCompare === savedHash;
};

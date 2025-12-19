const { verifyToken } = require('@sidaroco/auth');
const ClaimTypes = require('@sidaroco/auth/claimTypes');

function Authorize(options = {}) {
  const { roles } = options;

  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Token Required' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      req.user = {
        id: decoded[ClaimTypes.NameIdentifier],
        email: decoded[ClaimTypes.Name],
        username: decoded[ClaimTypes.GivenName],
        role: decoded[ClaimTypes.Role]
      };

      if (roles && roles.length > 0) {
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({ msg: 'Access Denied' });
        }
      }

      next();
    } catch (err) {
      return res.status(401).json({ msg: 'Invalid or Expired Token' });
    }
  };
}

module.exports = {
  Authorize
};

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const ClaimTypes = require('./claimTypes');

const PRIVATE_KEY =
  process.env.JWT_PRIVATE_KEY ??
  (process.env.JWT_PRIVATE_KEY_PATH
    ? require('fs').readFileSync(process.env.JWT_PRIVATE_KEY_PATH, 'utf8')
    : null);

const PUBLIC_KEY =
  process.env.JWT_PUBLIC_KEY ??
  (process.env.JWT_PUBLIC_KEY_PATH
    ? require('fs').readFileSync(process.env.JWT_PUBLIC_KEY_PATH, 'utf8')
    : null);

if (!PRIVATE_KEY || !PUBLIC_KEY) {
  throw new Error(
    '[auth] Missing JWT keys. Set JWT_PRIVATE_KEY / JWT_PUBLIC_KEY or *_PATH env vars.'
  );
}

//Esta madre namas es para el auth service
function generateToken({ id, email, username, role }) {
  return jwt.sign(
    {
      [ClaimTypes.NameIdentifier]: id,
      [ClaimTypes.Name]: email,
      [ClaimTypes.GivenName]: username,
      [ClaimTypes.Role]: role
    },
    PRIVATE_KEY,
    {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: 'sidaroco',
      audience: 'sidarocoUsuarios'
    }
  );
}

//esta madre es para todos los servicios
function verifyToken(token) {
  return jwt.verify(token, PUBLIC_KEY, {
    algorithms: ['RS256'],
    issuer: 'sidaroco',
    audience: 'sidarocoUsuarios'
  });
}

module.exports = {
  generateToken,
  verifyToken
};

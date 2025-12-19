const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const ClaimTypes = require('./claimTypes');

const PRIVATE_KEY = fs.readFileSync(
  path.join(__dirname, '../keys/private.key'),
  'utf8'
);

const PUBLIC_KEY = fs.readFileSync(
  path.join(__dirname, '../keys/public.key'),
  'utf8'
);

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

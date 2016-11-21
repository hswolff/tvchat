import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export function verifyToken(rawAccessToken) {
  return new Promise((resolve, reject) => {
    let decoded;
    try {
      decoded = jwt.verify(rawAccessToken, process.env.JWT_SECRET);
    } catch (e) {
      reject(e);
    }

    resolve(decoded);
  });
}

export function isTokenValid(accessToken) {
  const { exp } = accessToken;
  const nowSeconds = Date.now() / 1000;

  // If our expiration is past now then we're still valid.
  return exp > nowSeconds;
}

export async function verifyAndValidateToken(rawAccessToken) {
  const decoded = await verifyToken(rawAccessToken);
  if (isTokenValid(decoded)) {
    return decoded;
  } else {
    throw new Error('Invalid token');
  }
}

export function createToken(user) {
  let scopes;

  // Check if the user object passed in
  // has admin set to true, and if so, set
  // scopes to admin
  if (user.admin) {
    scopes = 'admin';
  }

  // Sign the JWT
  const accessToken = jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username,
    scope: scopes,
  }, process.env.JWT_SECRET, { expiresIn: '1.5h' });

  const accessTokenExpiration = jwt.decode(accessToken).exp;

  return {
    accessToken,
    accessTokenExpiration,
  };
}

export function hashPassword(password) {
  return new Promise((resolve, reject) => {
    // Generate a salt at level 10 strength
    bcrypt.genSalt(10, (__, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  });
}

export function validatePassword(hashedPassword, password) {
  return bcrypt.compareSync(hashedPassword, password);
}

export function createRefreshToken() {
  return crypto.randomBytes(12).toString('hex');
}

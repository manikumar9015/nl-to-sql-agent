const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getMongoDb } = require('./dbPoolManager');

const USERS_COLLECTION = 'users';

// It's critical to have a secret for signing JWTs. Store this in your .env file.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the .env file.');
}

async function registerUser(username, password, role = 'user') {
  const db = getMongoDb();
  const users = db.collection(USERS_COLLECTION);

  // Check if user already exists
  const existingUser = await users.findOne({ username });
  if (existingUser) {
    throw new Error('Username already exists.');
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10); // 10 is the salt rounds

  const newUser = {
    username,
    passwordHash,
    role, // 'user' or 'admin'
    createdAt: new Date(),
  };

  await users.insertOne(newUser);
  return { success: true, message: 'User registered successfully.' };
}

async function loginUser(username, password) {
  const db = getMongoDb();
  const user = await db.collection(USERS_COLLECTION).findOne({ username });

  if (!user) {
    throw new Error('Invalid credentials.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials.');
  }

  // If credentials are valid, create a JWT
  const token = jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' } // Token expires in 1 day
  );

  return { token, user: { username: user.username, role: user.role } };
}

module.exports = { registerUser, loginUser };
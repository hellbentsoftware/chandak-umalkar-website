import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import documentRoutes from './documentRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5555;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// JWT Middleware to verify tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Make database connection available to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Document routes
app.use('/api/documents', authenticateToken, documentRoutes);

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    // Fetch user by email
    const [rows] = await db.execute(
      'SELECT * FROM user WHERE email_id = ?',
      [email]
    );
    if (rows.length === 1) {
      const user = rows[0];
      // Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Hello Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email_id,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email_id: user.email_id,
          role: user.role,
          client_code: user.client_code,
          phone_number: user.phone_number
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Protected route to get current user info
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, first_name, last_name, email_id, role, client_code, phone_number FROM user WHERE id = ?',
      [req.user.id]
    );
    
    if (rows.length === 1) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin-only route example
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, first_name, last_name, email_id, role, client_code, phone_number FROM user'
    );
    const users = rows.map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email_id,
      mobileNumber: user.phone_number,
      customerCode: user.client_code,
      role: user.role
    }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
app.post('/api/admin/users', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    mobileNumber,
    customerCode,
    aadharNumber,
    panNumber,
    role,
    password
  } = req.body;

  if (
    !firstName || !lastName || !email || !mobileNumber ||
    !customerCode || !role || !password
  ) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.execute(
      `INSERT INTO user
        (first_name, last_name, email_id, phone_number, client_code, aadhar_number, pan_number, role, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        email,
        mobileNumber,
        customerCode,
        aadharNumber || null,
        panNumber || null,
        role,
        hashedPassword
      ]
    );
    res.status(201).json({ message: 'User created successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Email or client code already exists.' });
    } else {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
});

// Logout route (client-side token removal)
app.post('/api/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 
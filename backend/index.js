import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import documentRoutes from './documentRoutes.js'; // Uncomment if you have document routes

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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'chandakumalkarassociates@gmail.com',
    pass: 'bdqzaszjmpdactsq'
  }
});

// Allow requests from your frontend origin
app.use(cors({
  origin: true,
  credentials: true,
}));

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

// Document routes (uncomment if you have documentRoutes.js)
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
        return res.status(401).json({ message: 'Invalid credentials' });
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

// Admin-only route to get all users
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, first_name, last_name, email_id, role, client_code, phone_number FROM user WHERE role = 'client'"
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

// Admin-only route to add a new user
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

  // Check if user exists by email, aadhar number, pan number, client code, or phone number
  const [existing] = await db.execute(
    `SELECT id FROM user WHERE 
      email_id = ? OR 
      aadhar_number = ? OR 
      pan_number = ? OR 
      client_code = ? OR 
      phone_number = ?`,
    [email, aadharNumber, panNumber, customerCode, mobileNumber]
  );
  if (existing.length > 0) {
    return res.status(409).json({ message: 'User already present' });
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
    // Use improved HTML email template
    const mailOptions = {
      from: 'chandakumalkarassociates@gmail.com',
      to: email,
      subject: 'Welcome to Chandak Umalkar Associates',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px #e0e0e0;">
          <div style="background: linear-gradient(90deg, #4f8cff, #6a82fb); color: #fff; padding: 24px 32px;">
            <h2 style="margin: 0; font-size: 1.7rem;">Welcome to Chandak Umalkar Associates</h2>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 1.1rem; margin-bottom: 16px;">Hello <b>${firstName} ${lastName}</b>,</p>
            <p style="margin-bottom: 20px;">Your account has been created successfully. Here are your login details:</p>
            <table style="width: 100%; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Login Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #4f8cff; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">Password:</td>
                <td style="padding: 8px 0; color: #222;">${password}</td>
              </tr>
            </table>
            <p style="color: #888; font-size: 0.95rem; margin-bottom: 24px;">
              <b>Important:</b> Please change your password after logging in for the first time to keep your account secure.
            </p>
            <div style="text-align: center; margin-bottom: 16px;">
              <a href="https://chandakumalkar.hellbent.in/login" style="background: #4f8cff; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 1rem;">Login Now</a>
            </div>
            <p style="margin-top: 32px; color: #555;">Best regards,<br/>Chandak Umalkar Associates</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
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

// Admin statistics endpoint
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Total users
    const [userRows] = await db.execute('SELECT COUNT(*) as total FROM user');
    const totalUsers = userRows[0]?.total || 0;

    // Total documents uploaded
    const [docRows] = await db.execute('SELECT COUNT(*) as total FROM document');
    const documentsUploaded = docRows[0]?.total || 0;

    // New uploads this month
    const [monthRows] = await db.execute(`SELECT COUNT(*) as total FROM document WHERE YEAR(uploaded_at) = YEAR(CURDATE()) AND MONTH(uploaded_at) = MONTH(CURDATE())`);
    const newUploadsThisMonth = monthRows[0]?.total || 0;

    res.json({
      totalUsers,
      documentsUploaded,
      newUploadsThisMonth
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
});

// Admin-only: Get all documents
app.get('/api/admin/documents', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
        d.id,
        d.filename as fileName,
        d.document_type as fileType,
        d.description,
        d.file_size,
        d.mime_type,
        d.uploaded_at as uploadDate,
        d.file_path as fileUrl,
        d.user_id as userId,
        CONCAT(u.first_name, ' ', u.last_name) as userName,
        u.email_id as userEmail,
        YEAR(d.uploaded_at) as year
      FROM document d
      JOIN user u ON d.user_id = u.id
      ORDER BY d.uploaded_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching documents', error: err.message });
  }
});

// User statistics endpoint
app.get('/api/user/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Total documents uploaded by this user
    const [docRows] = await db.execute(
      'SELECT COUNT(*) as total FROM document WHERE user_id = ?',
      [userId]
    );
    const documentsUploaded = docRows[0]?.total || 0;

    // New uploads this month by this user
    const [monthRows] = await db.execute(
      `SELECT COUNT(*) as total FROM document WHERE user_id = ? AND YEAR(uploaded_at) = YEAR(CURDATE()) AND MONTH(uploaded_at) = MONTH(CURDATE())`,
      [userId]
    );
    const newUploadsThisMonth = monthRows[0]?.total || 0;

    res.json({
      documentsUploaded,
      newUploadsThisMonth
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
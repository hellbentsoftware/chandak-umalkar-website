import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'documents');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
    }
  }
}).single('file');

// Upload document
router.post('/upload', upload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { documentType, year } = req.body;
    const userId = req.user.id;

    if (!documentType || !year) {
      return res.status(400).json({ message: 'Document type and year are required' });
    }

    // Insert document record into database with original_filename
    const [result] = await req.db.execute(
      `INSERT INTO document (
        user_id, 
        filename,
        original_filename,
        file_path, 
        file_size, 
        mime_type, 
        document_type, 
        description,
        assessment_year
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        req.file.filename,
        req.file.originalname,  // Store original filename in dedicated column
        req.file.path,
        req.file.size,
        req.file.mimetype,
        documentType,
        `Document for year ${year}`,
        year
      ]
    );

    res.status(201).json({
      message: 'Document uploaded successfully',
      documentId: result.insertId,
      filename: req.file.originalname
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

// Get user's documents
router.get('/my-documents', async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await req.db.execute(
      `SELECT 
        id,
        filename,
        original_filename,
        document_type as fileType,
        description,
        file_size,
        mime_type,
        uploaded_at as uploadDate,
        file_path,
        assessment_year
      FROM document 
      WHERE user_id = ? 
      ORDER BY uploaded_at DESC`,
      [userId]
    );

    // Transform the data to match frontend expectations
    const documents = rows.map(doc => ({
      id: doc.id,
      fileName: doc.original_filename || doc.filename, // Use original_filename if available
      fileType: doc.fileType,
      year: doc.assessment_year || new Date().getFullYear().toString(),
      uploadDate: doc.uploadDate,
      fileUrl: `/api/documents/download/${doc.id}`,
      fileSize: doc.file_size,
      mimeType: doc.mime_type
    }));

    res.json(documents);

  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// Download document (for regular users)
router.get('/download/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;

    // Get document info and verify ownership
    const [rows] = await req.db.execute(
      'SELECT * FROM document WHERE id = ? AND user_id = ?',
      [documentId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = rows[0];
    const filePath = document.file_path;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath);
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Get file stats
    let fileStats;
    try {
      fileStats = fs.statSync(filePath);
    } catch (error) {
      console.error('Error reading file stats:', error);
      return res.status(500).json({ message: 'Error accessing file' });
    }

    // Use original filename for download
    const downloadFileName = document.original_filename || document.filename;

    // Set proper headers for file download
    res.setHeader('Content-Type', document.mime_type || 'application/octet-stream');
    res.setHeader('Content-Length', fileStats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    
    // Additional headers to ensure proper download
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Create read stream
    const fileStream = fs.createReadStream(filePath);
    
    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error reading file' });
      }
    });

    // Handle response events
    res.on('close', () => {
      fileStream.destroy();
    });

    res.on('finish', () => {
      console.log('File download completed for:', downloadFileName);
    });

    // Pipe the file to response
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error downloading document', error: error.message });
    }
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;

    // Get document info and verify ownership
    const [rows] = await req.db.execute(
      'SELECT * FROM document WHERE id = ? AND user_id = ?',
      [documentId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = rows[0];
    const filePath = document.file_path;

    // Delete from database first
    await req.db.execute(
      'DELETE FROM document WHERE id = ? AND user_id = ?',
      [documentId, userId]
    );

    // Delete file from filesystem
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('File deleted from filesystem:', filePath);
      }
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
      // Continue with success response as database deletion was successful
    }

    res.json({ message: 'Document deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
});

export default router;

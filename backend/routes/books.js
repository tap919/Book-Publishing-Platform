const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, authorize } = require('../middleware/auth');
const db = require('../config/database');
const formatterService = require('../services/formatterService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 },
});

// Create a new book
router.post('/', auth, upload.fields([
  { name: 'manuscript', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, subtitle, description, genre, language, price } = req.body;
    const authorId = req.user.id;

    const manuscriptFile = req.files?.manuscript?.[0]?.filename;
    const coverImage = req.files?.cover?.[0]?.filename;

    const result = await db.query(
      `INSERT INTO books (author_id, title, subtitle, description, genre, language, price, manuscript_file, cover_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [authorId, title, subtitle, description, genre, language || 'English', price, manuscriptFile, coverImage]
    );

    res.status(201).json({
      message: 'Book created successfully',
      book: result.rows[0],
    });
  } catch (error) {
    console.error('Book creation error:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// Get all books (with filtering)
router.get('/', async (req, res) => {
  try {
    const { genre, status, authorId, search } = req.query;
    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (genre) {
      query += ` AND genre = $${paramIndex}`;
      params.push(genre);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (authorId) {
      query += ` AND author_id = $${paramIndex}`;
      params.push(authorId);
      paramIndex++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const result = await db.query(query, params);
    res.json({ books: result.rows });
  } catch (error) {
    console.error('Fetch books error:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM books WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ book: result.rows[0] });
  } catch (error) {
    console.error('Fetch book error:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Update book
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, subtitle, description, genre, price, status } = req.body;
    const bookId = req.params.id;

    // Verify ownership
    const bookCheck = await db.query(
      'SELECT author_id FROM books WHERE id = $1',
      [bookId]
    );

    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (bookCheck.rows[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await db.query(
      `UPDATE books 
       SET title = COALESCE($1, title),
           subtitle = COALESCE($2, subtitle),
           description = COALESCE($3, description),
           genre = COALESCE($4, genre),
           price = COALESCE($5, price),
           status = COALESCE($6, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [title, subtitle, description, genre, price, status, bookId]
    );

    res.json({
      message: 'Book updated successfully',
      book: result.rows[0],
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Format manuscript
router.post('/:id/format', auth, async (req, res) => {
  try {
    const { formatType, options } = req.body;
    const bookId = req.params.id;

    const book = await db.query('SELECT * FROM books WHERE id = $1', [bookId]);
    
    if (book.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Simulated manuscript text (in production, read from file)
    const manuscriptText = 'Sample manuscript content...';

    let formatResult;
    if (formatType === 'print') {
      formatResult = formatterService.formatForPrint(manuscriptText, options);
    } else if (formatType === 'epub') {
      formatResult = formatterService.formatForEpub(manuscriptText, book.rows[0]);
    }

    res.json({
      message: 'Manuscript formatted successfully',
      result: formatResult,
    });
  } catch (error) {
    console.error('Format manuscript error:', error);
    res.status(500).json({ error: 'Failed to format manuscript' });
  }
});

module.exports = router;

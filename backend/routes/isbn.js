const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const db = require('../config/database');
const isbnService = require('../services/isbnService');

const router = express.Router();

// Request ISBN for a book
router.post('/request', auth, async (req, res) => {
  try {
    const { bookId } = req.body;

    // Verify book exists and user owns it
    const book = await db.query(
      'SELECT * FROM books WHERE id = $1 AND author_id = $2',
      [bookId, req.user.id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found or not authorized' });
    }

    // Check if book already has ISBN
    if (book.rows[0].isbn) {
      return res.status(400).json({ error: 'Book already has an ISBN' });
    }

    // Get available ISBN from pool
    const availableISBN = await db.query(
      'SELECT * FROM isbns WHERE status = $1 LIMIT 1',
      ['available']
    );

    let isbn;
    if (availableISBN.rows.length > 0) {
      // Use existing ISBN from pool
      isbn = availableISBN.rows[0];
      await db.query(
        'UPDATE isbns SET status = $1, book_id = $2 WHERE id = $3',
        ['assigned', bookId, isbn.id]
      );
    } else {
      // Generate new ISBN
      const newISBN = isbnService.generateISBN();
      const isbnResult = await db.query(
        'INSERT INTO isbns (isbn, book_id, status) VALUES ($1, $2, $3) RETURNING *',
        [newISBN, bookId, 'assigned']
      );
      isbn = isbnResult.rows[0];
    }

    // Update book with ISBN
    await db.query(
      'UPDATE books SET isbn = $1, isbn_status = $2 WHERE id = $3',
      [isbn.isbn, 'assigned', bookId]
    );

    res.json({
      message: 'ISBN assigned successfully',
      isbn: isbn.isbn,
    });
  } catch (error) {
    console.error('ISBN request error:', error);
    res.status(500).json({ error: 'Failed to request ISBN' });
  }
});

// Register ISBN with agency
router.post('/register', auth, async (req, res) => {
  try {
    const { bookId, metadata } = req.body;

    const book = await db.query(
      'SELECT * FROM books WHERE id = $1 AND author_id = $2',
      [bookId, req.user.id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found or not authorized' });
    }

    if (!book.rows[0].isbn) {
      return res.status(400).json({ error: 'Book does not have an ISBN assigned' });
    }

    // Register with ISBN agency
    const registrationResult = await isbnService.registerISBN(
      book.rows[0].isbn,
      { ...book.rows[0], ...metadata }
    );

    if (registrationResult.success) {
      // Update status
      await db.query(
        'UPDATE books SET isbn_status = $1 WHERE id = $2',
        ['registered', bookId]
      );

      await db.query(
        'UPDATE isbns SET status = $1, registered_at = CURRENT_TIMESTAMP WHERE isbn = $2',
        ['registered', book.rows[0].isbn]
      );
    }

    res.json({
      message: 'ISBN registered successfully',
      registration: registrationResult,
    });
  } catch (error) {
    console.error('ISBN registration error:', error);
    res.status(500).json({ error: 'Failed to register ISBN' });
  }
});

// Purchase ISBN batch (admin only)
router.post('/purchase-batch', auth, authorize('admin'), async (req, res) => {
  try {
    const { quantity } = req.body;

    const batchResult = await isbnService.purchaseISBNBatch(quantity || 10);

    // Insert ISBNs into database
    for (const isbn of batchResult.isbns) {
      await db.query(
        'INSERT INTO isbns (isbn, status) VALUES ($1, $2)',
        [isbn.isbn, 'available']
      );
    }

    res.json({
      message: 'ISBN batch purchased successfully',
      batch: batchResult,
    });
  } catch (error) {
    console.error('ISBN batch purchase error:', error);
    res.status(500).json({ error: 'Failed to purchase ISBN batch' });
  }
});

// Validate ISBN
router.post('/validate', async (req, res) => {
  try {
    const { isbn } = req.body;
    const isValid = isbnService.validateISBN(isbn);

    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate ISBN' });
  }
});

module.exports = router;

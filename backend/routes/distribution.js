const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../config/database');
const distributionService = require('../services/distributionService');

const router = express.Router();

// Distribute book to retailers
router.post('/distribute', auth, async (req, res) => {
  try {
    const { bookId, retailers } = req.body;

    // Verify book ownership
    const book = await db.query(
      'SELECT b.*, u.first_name, u.last_name FROM books b JOIN users u ON b.author_id = u.id WHERE b.id = $1 AND b.author_id = $2',
      [bookId, req.user.id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found or not authorized' });
    }

    // Check if book is ready for distribution
    if (book.rows[0].status !== 'published') {
      return res.status(400).json({ error: 'Book must be published before distribution' });
    }

    if (!book.rows[0].isbn) {
      return res.status(400).json({ error: 'Book must have an ISBN for distribution' });
    }

    // Get metadata
    const metadata = await db.query(
      'SELECT * FROM book_metadata WHERE book_id = $1',
      [bookId]
    );

    const bookData = {
      ...book.rows[0],
      author_first_name: book.rows[0].first_name,
      author_last_name: book.rows[0].last_name,
    };

    let results;
    if (retailers && retailers.length > 0) {
      // Distribute to specific retailers
      results = [];
      for (const retailer of retailers) {
        let result;
        switch (retailer.toLowerCase()) {
          case 'amazon':
            result = await distributionService.distributeToAmazon(
              distributionService.prepareMetadata(bookData, metadata.rows[0] || {})
            );
            break;
          case 'barnes-noble':
            result = await distributionService.distributeToBarnesNoble(
              distributionService.prepareMetadata(bookData, metadata.rows[0] || {})
            );
            break;
          case 'apple':
            result = await distributionService.distributeToAppleBooks(
              distributionService.prepareMetadata(bookData, metadata.rows[0] || {})
            );
            break;
          case 'google':
            result = await distributionService.distributeToGooglePlay(
              distributionService.prepareMetadata(bookData, metadata.rows[0] || {})
            );
            break;
          default:
            result = { success: false, error: 'Unknown retailer' };
        }
        results.push(result);

        // Save distribution record
        if (result.success) {
          await db.query(
            'INSERT INTO retailer_distributions (book_id, retailer_name, distribution_status, retailer_book_id, submitted_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
            [bookId, result.retailer, result.status, result.retailerBookId]
          );
        }
      }
    } else {
      // Distribute to all retailers
      results = await distributionService.distributeToAll(bookData, metadata.rows[0] || {});
      
      // Save distribution records
      for (const result of results.results) {
        if (result.success) {
          await db.query(
            'INSERT INTO retailer_distributions (book_id, retailer_name, distribution_status, retailer_book_id, submitted_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
            [bookId, result.retailer, result.status, result.retailerBookId]
          );
        }
      }
    }

    res.json({
      message: 'Distribution initiated successfully',
      results,
    });
  } catch (error) {
    console.error('Distribution error:', error);
    res.status(500).json({ error: 'Failed to distribute book' });
  }
});

// Get distribution status
router.get('/status/:bookId', auth, async (req, res) => {
  try {
    const distributions = await db.query(
      'SELECT * FROM retailer_distributions WHERE book_id = $1',
      [req.params.bookId]
    );

    res.json({ distributions: distributions.rows });
  } catch (error) {
    console.error('Get distribution status error:', error);
    res.status(500).json({ error: 'Failed to fetch distribution status' });
  }
});

// Update distribution
router.put('/update/:distributionId', auth, async (req, res) => {
  try {
    const { updates } = req.body;
    const distributionId = req.params.distributionId;

    const distribution = await db.query(
      'SELECT * FROM retailer_distributions WHERE id = $1',
      [distributionId]
    );

    if (distribution.rows.length === 0) {
      return res.status(404).json({ error: 'Distribution not found' });
    }

    const updateResult = await distributionService.updateDistribution(
      distribution.rows[0].retailer_book_id,
      distribution.rows[0].retailer_name,
      updates
    );

    res.json({
      message: 'Distribution updated successfully',
      result: updateResult,
    });
  } catch (error) {
    console.error('Update distribution error:', error);
    res.status(500).json({ error: 'Failed to update distribution' });
  }
});

module.exports = router;

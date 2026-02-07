const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get reviews for a book
router.get('/book/:bookId', async (req, res) => {
  try {
    const reviews = await db.query(
      `SELECT br.*, u.first_name, u.last_name
       FROM book_reviews br
       JOIN users u ON br.user_id = u.id
       WHERE br.book_id = $1
       ORDER BY br.created_at DESC`,
      [req.params.bookId]
    );

    // Get average rating
    const avgRating = await db.query(
      'SELECT AVG(rating) as average, COUNT(*) as total FROM book_reviews WHERE book_id = $1',
      [req.params.bookId]
    );

    res.json({
      reviews: reviews.rows,
      statistics: {
        averageRating: parseFloat(avgRating.rows[0].average || 0).toFixed(1),
        totalReviews: parseInt(avgRating.rows[0].total),
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create a review
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, rating, reviewText } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed this book
    const existingReview = await db.query(
      'SELECT id FROM book_reviews WHERE book_id = $1 AND user_id = $2',
      [bookId, req.user.id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this book' });
    }

    const result = await db.query(
      'INSERT INTO book_reviews (book_id, user_id, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *',
      [bookId, req.user.id, rating, reviewText]
    );

    // Track interaction
    await db.query(
      'INSERT INTO user_interactions (user_id, book_id, interaction_type) VALUES ($1, $2, $3)',
      [req.user.id, bookId, 'review']
    );

    res.status(201).json({
      message: 'Review created successfully',
      review: result.rows[0],
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update a review
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, reviewText } = req.body;

    // Verify ownership
    const review = await db.query(
      'SELECT * FROM book_reviews WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (review.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or not authorized' });
    }

    const result = await db.query(
      'UPDATE book_reviews SET rating = COALESCE($1, rating), review_text = COALESCE($2, review_text) WHERE id = $3 RETURNING *',
      [rating, reviewText, req.params.id]
    );

    res.json({
      message: 'Review updated successfully',
      review: result.rows[0],
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await db.query(
      'SELECT * FROM book_reviews WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (review.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or not authorized' });
    }

    await db.query('DELETE FROM book_reviews WHERE id = $1', [req.params.id]);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Mark review as helpful
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    await db.query(
      'UPDATE book_reviews SET helpful_count = helpful_count + 1 WHERE id = $1',
      [req.params.id]
    );

    res.json({ message: 'Marked as helpful' });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ error: 'Failed to mark as helpful' });
  }
});

module.exports = router;

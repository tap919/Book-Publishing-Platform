const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../config/database');
const recommendationService = require('../services/recommendationService');

const router = express.Router();

// Get personalized recommendations for user
router.get('/personalized', auth, async (req, res) => {
  try {
    // Get user's interaction history
    const interactions = await db.query(
      `SELECT ui.*, b.genre as book_genre
       FROM user_interactions ui
       JOIN books b ON ui.book_id = b.id
       WHERE ui.user_id = $1
       ORDER BY ui.created_at DESC
       LIMIT 100`,
      [req.user.id]
    );

    // Get all published books
    const allBooks = await db.query(
      `SELECT b.*, 
              COUNT(DISTINCT br.id) as reviewCount,
              AVG(br.rating) as averageRating
       FROM books b
       LEFT JOIN book_reviews br ON b.id = br.book_id
       WHERE b.status = 'published'
       GROUP BY b.id
       LIMIT 500`
    );

    const recommendations = await recommendationService.getPersonalizedRecommendations(
      req.user.id,
      interactions.rows,
      allBooks.rows
    );

    res.json({ recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get trending books
router.get('/trending', async (req, res) => {
  try {
    const books = await db.query(
      `SELECT b.*, 
              COUNT(DISTINCT br.id) as reviewCount,
              AVG(br.rating) as averageRating
       FROM books b
       LEFT JOIN book_reviews br ON b.id = br.book_id
       WHERE b.status = 'published'
       GROUP BY b.id`
    );

    const recentInteractions = await db.query(
      `SELECT * FROM user_interactions 
       WHERE created_at > NOW() - INTERVAL '7 days'`
    );

    const trending = await recommendationService.getTrendingBooks(
      books.rows,
      recentInteractions.rows
    );

    res.json({ trending });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ error: 'Failed to fetch trending books' });
  }
});

// Get similar books
router.get('/similar/:bookId', async (req, res) => {
  try {
    const targetBook = await db.query(
      'SELECT * FROM books WHERE id = $1',
      [req.params.bookId]
    );

    if (targetBook.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const allBooks = await db.query(
      `SELECT b.*, 
              COUNT(DISTINCT br.id) as reviewCount,
              AVG(br.rating) as averageRating
       FROM books b
       LEFT JOIN book_reviews br ON b.id = br.book_id
       WHERE b.status = 'published' AND b.id != $1
       GROUP BY b.id
       LIMIT 200`,
      [req.params.bookId]
    );

    const similar = recommendationService.getSimilarBooks(
      targetBook.rows[0],
      allBooks.rows
    );

    res.json({ similar });
  } catch (error) {
    console.error('Get similar books error:', error);
    res.status(500).json({ error: 'Failed to fetch similar books' });
  }
});

// Get curated books
router.get('/curated', async (req, res) => {
  try {
    const books = await db.query(
      `SELECT b.*, 
              COUNT(DISTINCT br.id) as reviewCount,
              AVG(br.rating) as averageRating
       FROM books b
       LEFT JOIN book_reviews br ON b.id = br.book_id
       WHERE b.status = 'published'
       GROUP BY b.id
       HAVING COUNT(DISTINCT br.id) >= 5 AND AVG(br.rating) >= 4.0`
    );

    const curated = recommendationService.getCuratedBooks(books.rows);

    res.json({ curated });
  } catch (error) {
    console.error('Get curated books error:', error);
    res.status(500).json({ error: 'Failed to fetch curated books' });
  }
});

// Track user interaction
router.post('/track', auth, async (req, res) => {
  try {
    const { bookId, interactionType } = req.body;

    await db.query(
      'INSERT INTO user_interactions (user_id, book_id, interaction_type) VALUES ($1, $2, $3)',
      [req.user.id, bookId, interactionType]
    );

    res.json({ message: 'Interaction tracked successfully' });
  } catch (error) {
    console.error('Track interaction error:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
});

module.exports = router;

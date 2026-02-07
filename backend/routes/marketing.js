const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all marketing services
router.get('/services', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM marketing_services ORDER BY price ASC'
    );
    res.json({ services: result.rows });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch marketing services' });
  }
});

// Subscribe to marketing service
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { serviceId, bookId, duration } = req.body;

    // Verify book ownership
    const book = await db.query(
      'SELECT * FROM books WHERE id = $1 AND author_id = $2',
      [bookId, req.user.id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found or not authorized' });
    }

    // Get service details
    const service = await db.query(
      'SELECT * FROM marketing_services WHERE id = $1',
      [serviceId]
    );

    if (service.rows.length === 0) {
      return res.status(404).json({ error: 'Marketing service not found' });
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (duration || 30));

    const result = await db.query(
      'INSERT INTO author_marketing_subscriptions (user_id, service_id, book_id, end_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, serviceId, bookId, endDate]
    );

    res.status(201).json({
      message: 'Subscribed to marketing service successfully',
      subscription: result.rows[0],
      service: service.rows[0],
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe to marketing service' });
  }
});

// Get author's active subscriptions
router.get('/subscriptions', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ams.*, ms.name, ms.description, ms.service_type, b.title
       FROM author_marketing_subscriptions ams
       JOIN marketing_services ms ON ams.service_id = ms.id
       JOIN books b ON ams.book_id = b.id
       WHERE ams.user_id = $1 AND ams.status = 'active'
       ORDER BY ams.start_date DESC`,
      [req.user.id]
    );

    res.json({ subscriptions: result.rows });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Cancel subscription
router.post('/cancel/:subscriptionId', auth, async (req, res) => {
  try {
    const subscription = await db.query(
      'SELECT * FROM author_marketing_subscriptions WHERE id = $1 AND user_id = $2',
      [req.params.subscriptionId, req.user.id]
    );

    if (subscription.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await db.query(
      'UPDATE author_marketing_subscriptions SET status = $1 WHERE id = $2',
      ['cancelled', req.params.subscriptionId]
    );

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Create marketing service (admin only)
router.post('/services', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, description, price, serviceType } = req.body;

    const result = await db.query(
      'INSERT INTO marketing_services (name, description, price, service_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, price, serviceType]
    );

    res.status(201).json({
      message: 'Marketing service created successfully',
      service: result.rows[0],
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create marketing service' });
  }
});

module.exports = router;

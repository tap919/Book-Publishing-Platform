const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../config/database');
const podService = require('../services/podService');

const router = express.Router();

// Create POD order
router.post('/orders', async (req, res) => {
  try {
    const { bookId, quantity, customerEmail, customerName, shippingAddress, provider } = req.body;

    // Get book details
    const book = await db.query('SELECT * FROM books WHERE id = $1', [bookId]);
    
    if (book.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const bookData = book.rows[0];

    // Calculate cost
    const bestProvider = provider || await podService.selectBestProvider(bookData, { quantity });
    const costEstimate = podService.calculatePrintingCost(bookData.page_count, quantity, bestProvider);

    // Create order in database
    const orderResult = await db.query(
      `INSERT INTO pod_orders (book_id, customer_email, customer_name, quantity, unit_cost, total_cost, shipping_address, pod_provider, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [bookId, customerEmail, customerName, quantity, costEstimate.unitCost, costEstimate.totalCost, shippingAddress, bestProvider, 'pending']
    );

    const order = orderResult.rows[0];

    // Submit to POD provider
    let providerResult;
    if (bestProvider === 'ingram') {
      providerResult = await podService.createIngramOrder(bookData, { quantity, shippingAddress });
    } else if (bestProvider === 'lulu') {
      providerResult = await podService.createLuluOrder(bookData, { quantity, shippingAddress });
    }

    // Update order with provider ID
    if (providerResult.success) {
      await db.query(
        'UPDATE pod_orders SET provider_order_id = $1, status = $2 WHERE id = $3',
        [providerResult.orderId, 'processing', order.id]
      );
    }

    res.status(201).json({
      message: 'POD order created successfully',
      order,
      costEstimate,
      providerResult,
    });
  } catch (error) {
    console.error('POD order error:', error);
    res.status(500).json({ error: 'Failed to create POD order' });
  }
});

// Get order status
router.get('/orders/:id', auth, async (req, res) => {
  try {
    const order = await db.query(
      'SELECT * FROM pod_orders WHERE id = $1',
      [req.params.id]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = order.rows[0];

    // Get status from provider
    const providerStatus = await podService.getOrderStatus(
      orderData.provider_order_id,
      orderData.pod_provider
    );

    res.json({
      order: orderData,
      providerStatus,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Calculate printing cost estimate
router.post('/cost-estimate', async (req, res) => {
  try {
    const { pageCount, quantity, provider } = req.body;

    const estimate = podService.calculatePrintingCost(
      pageCount,
      quantity,
      provider || 'ingram'
    );

    res.json({ estimate });
  } catch (error) {
    console.error('Cost estimate error:', error);
    res.status(500).json({ error: 'Failed to calculate cost' });
  }
});

module.exports = router;

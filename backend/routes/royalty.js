const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../config/database');
const blockchainService = require('../services/blockchainService');

const router = express.Router();

// Calculate royalty split for a book
router.post('/calculate', auth, async (req, res) => {
  try {
    const { bookId, saleAmount } = req.body;

    // Get book and royalty splits
    const book = await db.query('SELECT * FROM books WHERE id = $1', [bookId]);
    
    if (book.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const splits = await db.query(
      'SELECT * FROM royalty_splits WHERE book_id = $1',
      [bookId]
    );

    // Calculate fees
    const fees = blockchainService.calculateFees(saleAmount);

    // Calculate individual splits
    let royaltyDistribution = [];
    
    if (splits.rows.length > 0) {
      // Multiple recipients
      for (const split of splits.rows) {
        royaltyDistribution.push({
          userId: split.user_id,
          role: split.role,
          percentage: split.split_percentage,
          amount: (fees.authorRoyalty * split.split_percentage / 100).toFixed(2),
        });
      }
    } else {
      // Single author gets all royalty
      royaltyDistribution.push({
        userId: book.rows[0].author_id,
        role: 'author',
        percentage: 100,
        amount: fees.authorRoyalty.toFixed(2),
      });
    }

    res.json({
      saleAmount: fees.saleAmount,
      platformFee: fees.platformFee,
      platformFeeRate: fees.platformFeeRate,
      authorRoyalty: fees.authorRoyalty,
      distribution: royaltyDistribution,
    });
  } catch (error) {
    console.error('Royalty calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate royalty' });
  }
});

// Add royalty split for co-authors/contributors
router.post('/splits', auth, async (req, res) => {
  try {
    const { bookId, userId, splitPercentage, role } = req.body;

    // Verify book ownership
    const book = await db.query(
      'SELECT * FROM books WHERE id = $1 AND author_id = $2',
      [bookId, req.user.id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found or not authorized' });
    }

    // Check total split doesn't exceed 100%
    const existingSplits = await db.query(
      'SELECT SUM(split_percentage) as total FROM royalty_splits WHERE book_id = $1',
      [bookId]
    );

    const currentTotal = parseFloat(existingSplits.rows[0]?.total || 0);
    if (currentTotal + splitPercentage > 100) {
      return res.status(400).json({ error: 'Total split percentage exceeds 100%' });
    }

    const result = await db.query(
      'INSERT INTO royalty_splits (book_id, user_id, split_percentage, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [bookId, userId, splitPercentage, role]
    );

    res.status(201).json({
      message: 'Royalty split added successfully',
      split: result.rows[0],
    });
  } catch (error) {
    console.error('Add split error:', error);
    res.status(500).json({ error: 'Failed to add royalty split' });
  }
});

// Process royalty payment via blockchain
router.post('/pay', auth, authorize('admin'), async (req, res) => {
  try {
    const { saleId } = req.body;

    // Get sale details
    const sale = await db.query(
      'SELECT * FROM sales WHERE id = $1',
      [saleId]
    );

    if (sale.rows.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    const saleData = sale.rows[0];

    // Get book and calculate splits
    const book = await db.query('SELECT * FROM books WHERE id = $1', [saleData.book_id]);
    const splits = await db.query(
      'SELECT rs.*, u.wallet_address FROM royalty_splits rs JOIN users u ON rs.user_id = u.id WHERE rs.book_id = $1',
      [saleData.book_id]
    );

    // Prepare payments
    const payments = [];
    
    if (splits.rows.length > 0) {
      for (const split of splits.rows) {
        const amount = saleData.royalty_amount * split.split_percentage / 100;
        if (split.wallet_address) {
          payments.push({
            userId: split.user_id,
            recipientAddress: split.wallet_address,
            amount,
            bookId: saleData.book_id,
          });
        }
      }
    } else {
      // Pay main author
      const author = await db.query(
        'SELECT wallet_address FROM users WHERE id = $1',
        [book.rows[0].author_id]
      );
      
      if (author.rows[0]?.wallet_address) {
        payments.push({
          userId: book.rows[0].author_id,
          recipientAddress: author.rows[0].wallet_address,
          amount: saleData.royalty_amount,
          bookId: saleData.book_id,
        });
      }
    }

    // Process blockchain payments
    const paymentResult = await blockchainService.payMultipleRoyalties(payments);

    // Record payments in database
    for (const payment of paymentResult.payments) {
      if (payment.success) {
        await db.query(
          'INSERT INTO royalty_payments (sale_id, user_id, amount, payment_method, blockchain_tx_hash, status, paid_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)',
          [saleId, payment.userId, payment.amountUSD, 'blockchain', payment.transactionHash, 'completed']
        );
      }
    }

    res.json({
      message: 'Royalties paid successfully',
      result: paymentResult,
    });
  } catch (error) {
    console.error('Royalty payment error:', error);
    res.status(500).json({ error: 'Failed to process royalty payment' });
  }
});

// Get royalty history for an author
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await db.query(
      `SELECT rp.*, b.title, s.sale_amount 
       FROM royalty_payments rp
       JOIN sales s ON rp.sale_id = s.id
       JOIN books b ON s.book_id = b.id
       WHERE rp.user_id = $1
       ORDER BY rp.created_at DESC
       LIMIT 100`,
      [req.user.id]
    );

    res.json({ payments: payments.rows });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch royalty history' });
  }
});

module.exports = router;

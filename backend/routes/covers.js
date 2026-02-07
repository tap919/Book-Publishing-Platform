const express = require('express');
const { auth } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get available cover templates
router.get('/', async (req, res) => {
  try {
    const { category, isPremium } = req.query;
    
    let query = 'SELECT * FROM cover_templates WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (isPremium !== undefined) {
      query += ` AND is_premium = $${paramIndex}`;
      params.push(isPremium === 'true');
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch cover templates' });
  }
});

// Apply cover template to book
router.post('/apply', auth, async (req, res) => {
  try {
    const { bookId, templateId, customizations } = req.body;

    // Verify book ownership
    const book = await db.query(
      'SELECT * FROM books WHERE id = $1 AND author_id = $2',
      [bookId, req.user.id]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found or not authorized' });
    }

    // Get template
    const template = await db.query(
      'SELECT * FROM cover_templates WHERE id = $1',
      [templateId]
    );

    if (template.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if premium and user has access
    if (template.rows[0].is_premium && template.rows[0].price > 0) {
      // In production, verify payment
      console.log('Premium template - payment required');
    }

    // Generate cover with customizations
    const coverResult = {
      success: true,
      coverUrl: `/uploads/covers/${bookId}-${templateId}.jpg`,
      customizations,
    };

    // Update book with new cover
    await db.query(
      'UPDATE books SET cover_image = $1 WHERE id = $2',
      [coverResult.coverUrl, bookId]
    );

    res.json({
      message: 'Cover template applied successfully',
      cover: coverResult,
    });
  } catch (error) {
    console.error('Apply template error:', error);
    res.status(500).json({ error: 'Failed to apply cover template' });
  }
});

// Upload custom cover template (admin only)
router.post('/upload', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, category, thumbnailUrl, templateFile, isPremium, price } = req.body;

    const result = await db.query(
      'INSERT INTO cover_templates (name, category, thumbnail_url, template_file, is_premium, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, category, thumbnailUrl, templateFile, isPremium || false, price || 0]
    );

    res.status(201).json({
      message: 'Cover template uploaded successfully',
      template: result.rows[0],
    });
  } catch (error) {
    console.error('Upload template error:', error);
    res.status(500).json({ error: 'Failed to upload cover template' });
  }
});

module.exports = router;

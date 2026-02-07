const db = require('../backend/config/database');
const bcrypt = require('bcrypt');

async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    // Seed sample users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const author1 = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, wallet_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['author1@example.com', passwordHash, 'Jane', 'Smith', 'author', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb']
    );

    const author2 = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, wallet_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['author2@example.com', passwordHash, 'John', 'Doe', 'author', '0x8ba1f109551bD432803012645Ac136ddd64DBA72']
    );

    console.log('✓ Sample users created');

    // Seed genres
    const genres = [
      { name: 'Fiction', description: 'Fictional works' },
      { name: 'Non-Fiction', description: 'Non-fictional works' },
      { name: 'Mystery', description: 'Mystery and thriller' },
      { name: 'Romance', description: 'Romance novels' },
      { name: 'Science Fiction', description: 'Sci-fi adventures' },
      { name: 'Fantasy', description: 'Fantasy worlds' },
      { name: 'Biography', description: 'Life stories' },
      { name: 'Self-Help', description: 'Personal development' },
    ];

    for (const genre of genres) {
      await db.query(
        'INSERT INTO genres (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [genre.name, genre.description]
      );
    }

    console.log('✓ Sample genres created');

    // Seed sample books
    if (author1.rows.length > 0) {
      await db.query(
        `INSERT INTO books (author_id, title, subtitle, description, isbn, genre, page_count, price, royalty_rate, status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [
          author1.rows[0].id,
          'The Great Adventure',
          'A Journey Beyond',
          'An epic tale of discovery and courage in uncharted territories.',
          '9781234567890',
          'Adventure',
          350,
          24.99,
          70.00,
          'published'
        ]
      );

      await db.query(
        `INSERT INTO books (author_id, title, description, genre, page_count, price, royalty_rate, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [
          author1.rows[0].id,
          'Mysteries of the Mind',
          'Exploring the depths of human consciousness and psychology.',
          'Non-Fiction',
          280,
          19.99,
          70.00,
          'draft'
        ]
      );
    }

    if (author2.rows.length > 0) {
      await db.query(
        `INSERT INTO books (author_id, title, description, isbn, genre, page_count, price, royalty_rate, status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [
          author2.rows[0].id,
          'Digital Revolution',
          'How technology is reshaping our world.',
          '9780987654321',
          'Technology',
          420,
          29.99,
          70.00,
          'published'
        ]
      );
    }

    console.log('✓ Sample books created');

    // Seed cover templates
    const templates = [
      { name: 'Modern Minimalist', category: 'Fiction', is_premium: false, price: 0 },
      { name: 'Classic Elegance', category: 'Fiction', is_premium: false, price: 0 },
      { name: 'Bold & Dramatic', category: 'Mystery', is_premium: true, price: 29.99 },
      { name: 'Romantic Sunset', category: 'Romance', is_premium: false, price: 0 },
      { name: 'Sci-Fi Future', category: 'Science Fiction', is_premium: true, price: 39.99 },
    ];

    for (const template of templates) {
      await db.query(
        'INSERT INTO cover_templates (name, category, is_premium, price) VALUES ($1, $2, $3, $4)',
        [template.name, template.category, template.is_premium, template.price]
      );
    }

    console.log('✓ Cover templates created');

    // Seed marketing services
    const services = [
      { name: 'Social Media Campaign', description: '30-day comprehensive social media promotion', price: 99.00, service_type: 'social_media' },
      { name: 'Email Marketing', description: 'Targeted email campaign to 10,000+ readers', price: 149.00, service_type: 'email_campaign' },
      { name: 'Book Review Service', description: 'Professional book review and rating', price: 49.00, service_type: 'book_review' },
      { name: 'Premium Advertising', description: 'Featured placement on platform homepage', price: 299.00, service_type: 'advertising' },
    ];

    for (const service of services) {
      await db.query(
        'INSERT INTO marketing_services (name, description, price, service_type) VALUES ($1, $2, $3, $4)',
        [service.name, service.description, service.price, service.service_type]
      );
    }

    console.log('✓ Marketing services created');

    // Seed ISBNs
    for (let i = 0; i < 10; i++) {
      const isbn = `978123456${String(i).padStart(4, '0')}`;
      await db.query(
        'INSERT INTO isbns (isbn, status) VALUES ($1, $2) ON CONFLICT (isbn) DO NOTHING',
        [isbn, 'available']
      );
    }

    console.log('✓ ISBN pool created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Email: author1@example.com');
    console.log('Password: password123');
    console.log('\nEmail: author2@example.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

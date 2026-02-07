# Quick Start Guide

Get the Book Publishing Platform running in 5 minutes!

## Prerequisites

- Node.js 16+ ([Download](https://nodejs.org/))
- PostgreSQL 12+ ([Download](https://www.postgresql.org/download/))

## Installation Steps

### 1. Clone & Install
```bash
git clone https://github.com/tap919/Book-Publishing-Platform.git
cd Book-Publishing-Platform
npm install
```

### 2. Database Setup
```bash
# Create database (Linux/Mac)
createdb book_publishing_platform

# Or on Windows with psql:
psql -U postgres
CREATE DATABASE book_publishing_platform;
\q

# Load schema
psql -U postgres book_publishing_platform < database/schema.sql

# Add sample data (optional)
npm run seed
```

### 3. Configure Environment
```bash
# Copy example config
cp .env.example .env

# Edit .env with your settings (at minimum, set these):
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=your_random_32_char_secret
```

### 4. Start Server
```bash
npm start
```

The API will start at `http://localhost:5000`

## Verify Installation

### 1. Check Health Endpoint
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"ok","message":"Book Publishing Platform API is running"}
```

### 2. View Demo Page
Open your browser and visit:
```
http://localhost:5000
```

You should see the platform homepage!

### 3. Test Authentication
```bash
# Register a new author
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "myauthor@example.com",
    "password": "securepass123",
    "firstName": "John",
    "lastName": "Writer",
    "role": "author"
  }'
```

Save the returned `token` for authenticated requests.

### 4. Create Your First Book
```bash
# Use the token from registration
curl -X POST http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Book",
    "description": "An amazing story",
    "genre": "Fiction",
    "price": 19.99
  }'
```

## Sample Data

If you ran `npm run seed`, you can use these test accounts:

**Author Account 1:**
- Email: `author1@example.com`
- Password: `password123`

**Author Account 2:**
- Email: `author2@example.com`
- Password: `password123`

## Common Issues

### Port 5000 Already in Use
```bash
# Change PORT in .env file
PORT=3000
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
# Linux/Mac:
pg_isready

# Windows:
# Check Services for PostgreSQL service
```

### Permission Denied on Uploads
```bash
# Create and fix permissions
mkdir -p uploads
chmod 755 uploads
```

## Next Steps

1. **Read the API Documentation**: See `docs/API.md` for all available endpoints
2. **Explore Features**: Try ISBN generation, POD orders, royalty calculations
3. **Set Up Blockchain** (Optional): Configure Ethereum wallet for royalty payments
4. **Deploy**: See `docs/DEPLOYMENT.md` for production deployment

## Development Mode

For development with auto-reload:
```bash
npm run dev
```

## Testing

Run the test suite:
```bash
npm test
```

## API Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"author1@example.com","password":"password123"}'
```

### Get All Books
```bash
curl http://localhost:5000/api/books
```

### Request ISBN for Book
```bash
curl -X POST http://localhost:5000/api/isbn/request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookId":"YOUR_BOOK_ID"}'
```

### Calculate Printing Cost
```bash
curl -X POST http://localhost:5000/api/pod/cost-estimate \
  -H "Content-Type: application/json" \
  -d '{"pageCount":300,"quantity":100,"provider":"ingram"}'
```

### Get Personalized Recommendations
```bash
curl http://localhost:5000/api/recommendations/trending
```

## Support

- **Documentation**: `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/tap919/Book-Publishing-Platform/issues)
- **API Reference**: `docs/API.md`

## What's Included

✅ Complete REST API
✅ Authentication system
✅ Book management
✅ POD integration (IngramSpark/Lulu)
✅ ISBN management
✅ Blockchain royalty payments
✅ Multi-retailer distribution
✅ Recommendation engine
✅ Review system
✅ Marketing services

## Happy Publishing! 📚

Your platform is ready to compete with Amazon. Authors keep 85% of royalties and get paid instantly via blockchain!

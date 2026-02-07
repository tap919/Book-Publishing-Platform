# Book Publishing Platform

A comprehensive web platform for independent book publishing that competes with Amazon on cost and features.

## 🚀 Features

### Core Pillars

#### 1. Print-on-Demand Infrastructure
- White-label integration with IngramSpark and Lulu
- No inventory costs - books printed only when ordered
- Automated cost calculation and provider selection
- Volume discounts automatically applied
- Real-time order tracking

#### 2. Direct Distribution Plumbing
- ISBN registration and management system
- Comprehensive metadata management
- API integrations to push titles to major retailers:
  - Amazon
  - Barnes & Noble
  - Apple Books
  - Google Play Books
- Distribution status tracking

#### 3. Author Tooling
- **Manuscript Formatting**: Automated formatting for print (PDF) and digital (EPUB)
- **Cover Templates**: Professional templates with customization options
- **Royalty Splitting**: Support for co-authors, illustrators, and contributors
- **Analytics Dashboard**: Track sales, royalties, and reader engagement

#### 4. Payment Processing with Blockchain
- **Low Take Rates**: 15% platform fee (vs Amazon's 30-65%)
- **Blockchain Royalty Payments**: Instant, transparent payments via Ethereum
- **Smart Contract Integration**: Automated royalty distribution
- **Transaction History**: Complete blockchain transparency

#### 5. Discovery Layer
- **Genre Tagging**: Comprehensive categorization system
- **Recommendation Algorithm**: Personalized book suggestions
- **Community Curation**: Reviews and ratings from readers
- **Trending Books**: Real-time trending based on user interactions
- **Similar Books**: Content-based recommendations

#### 6. Value-Add Services
- Marketing services (promotion, advertising, email campaigns)
- Premium formatting options
- Social media marketing
- Book review services

## 📋 Prerequisites

- Node.js 16+ and npm
- PostgreSQL 12+
- Ethereum wallet (for blockchain features)
- IngramSpark/Lulu API keys (for POD)
- Stripe account (for payments)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/tap919/Book-Publishing-Platform.git
cd Book-Publishing-Platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Create PostgreSQL database
createdb book_publishing_platform

# Run schema
psql book_publishing_platform < database/schema.sql
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options:

- **Database**: PostgreSQL connection settings
- **JWT**: Secret key for authentication
- **Blockchain**: Ethereum network and contract configuration
- **POD Services**: IngramSpark and Lulu API credentials
- **Payment**: Stripe API keys
- **ISBN**: ISBN agency configuration

## 📚 API Documentation

### Authentication

#### Register
```
POST /api/auth/register
Body: {
  "email": "author@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "author",
  "walletAddress": "0x..." // Optional
}
```

#### Login
```
POST /api/auth/login
Body: {
  "email": "author@example.com",
  "password": "securepassword"
}
```

### Books

#### Create Book
```
POST /api/books
Headers: Authorization: Bearer <token>
FormData: {
  "title": "My Book",
  "description": "Book description",
  "genre": "Fiction",
  "price": 19.99,
  "manuscript": <file>,
  "cover": <file>
}
```

#### Get Books
```
GET /api/books?genre=Fiction&status=published&search=keyword
```

#### Format Manuscript
```
POST /api/books/:id/format
Body: {
  "formatType": "print", // or "epub"
  "options": {
    "trimSize": "6x9",
    "fontSize": 11
  }
}
```

### Print-on-Demand

#### Create POD Order
```
POST /api/pod/orders
Body: {
  "bookId": "uuid",
  "quantity": 100,
  "customerEmail": "customer@example.com",
  "shippingAddress": "123 Main St...",
  "provider": "ingram" // Optional
}
```

#### Get Cost Estimate
```
POST /api/pod/cost-estimate
Body: {
  "pageCount": 300,
  "quantity": 50,
  "provider": "ingram"
}
```

### ISBN Management

#### Request ISBN
```
POST /api/isbn/request
Body: { "bookId": "uuid" }
```

#### Register ISBN
```
POST /api/isbn/register
Body: {
  "bookId": "uuid",
  "metadata": { /* book metadata */ }
}
```

### Royalty Management

#### Calculate Royalty
```
POST /api/royalty/calculate
Body: {
  "bookId": "uuid",
  "saleAmount": 19.99
}
```

#### Add Royalty Split
```
POST /api/royalty/splits
Body: {
  "bookId": "uuid",
  "userId": "uuid",
  "splitPercentage": 20,
  "role": "illustrator"
}
```

#### Get Royalty History
```
GET /api/royalty/history
```

### Distribution

#### Distribute Book
```
POST /api/distribution/distribute
Body: {
  "bookId": "uuid",
  "retailers": ["Amazon", "Barnes-Noble", "Apple", "Google"]
}
```

#### Check Distribution Status
```
GET /api/distribution/status/:bookId
```

### Recommendations

#### Get Personalized Recommendations
```
GET /api/recommendations/personalized
Headers: Authorization: Bearer <token>
```

#### Get Trending Books
```
GET /api/recommendations/trending
```

#### Get Similar Books
```
GET /api/recommendations/similar/:bookId
```

### Reviews

#### Create Review
```
POST /api/reviews
Body: {
  "bookId": "uuid",
  "rating": 5,
  "reviewText": "Great book!"
}
```

#### Get Book Reviews
```
GET /api/reviews/book/:bookId
```

### Marketing Services

#### Get Services
```
GET /api/marketing/services
```

#### Subscribe to Service
```
POST /api/marketing/subscribe
Body: {
  "serviceId": "uuid",
  "bookId": "uuid",
  "duration": 30 // days
}
```

## 💰 Pricing Model

### Platform Fees
- **Standard Royalty**: 85% to author (15% platform fee)
- **Amazon Comparison**: 35-70% to author (30-65% Amazon fee)

### Value-Add Services (Optional)
- Marketing services: Starting at $49/month
- Premium formatting: $29 one-time
- Professional cover design: $99 one-time
- Advanced analytics: $19/month

## 🔐 Security

- JWT-based authentication
- bcrypt password hashing
- Blockchain transaction verification
- Input validation and sanitization
- SQL injection protection via parameterized queries

## 🧪 Testing

```bash
npm test
```

## 📦 Deployment

### Production Build
```bash
npm run build
```

### Docker (Coming Soon)
```bash
docker-compose up
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/tap919/Book-Publishing-Platform/issues)
- Email: support@bookpublishingplatform.com

## 🗺️ Roadmap

- [ ] Mobile app (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] AI-powered manuscript editing
- [ ] Audio book production integration
- [ ] International distribution expansion
- [ ] Multi-language support

## 🌟 Why Choose Us Over Amazon?

1. **Better Royalties**: 85% vs Amazon's 35-70%
2. **Transparent Payments**: Blockchain-based instant payments
3. **No Lock-in**: Distribute to all retailers simultaneously
4. **Author Tools**: Automated formatting, cover design, and marketing
5. **Fair Pricing**: Optional value-add services instead of forced cuts
6. **Print-on-Demand**: Zero inventory costs
7. **Community Focus**: Curated discovery and genuine reviews

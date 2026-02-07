# API Reference

## Table of Contents
1. [Authentication](#authentication)
2. [Books](#books)
3. [Print-on-Demand](#print-on-demand)
4. [ISBN Management](#isbn-management)
5. [Royalty System](#royalty-system)
6. [Distribution](#distribution)
7. [Recommendations](#recommendations)
8. [Reviews](#reviews)

## Base URL
```
http://localhost:5000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

- **POST** `/auth/register` - Register new user
- **POST** `/auth/login` - Login and get JWT token

### Example: Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@example.com",
    "password": "securePassword123",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "author"
  }'
```

## Books

### Key Endpoints
- **POST** `/books` 🔒 - Create new book
- **GET** `/books` - List books
- **GET** `/books/:id` - Get book details
- **PUT** `/books/:id` 🔒 - Update book
- **POST** `/books/:id/format` 🔒 - Format manuscript

## Print-on-Demand

### Key Endpoints
- **POST** `/pod/orders` - Create POD order
- **GET** `/pod/orders/:id` 🔒 - Get order status
- **POST** `/pod/cost-estimate` - Calculate cost

## ISBN Management

### Key Endpoints
- **POST** `/isbn/request` 🔒 - Request ISBN for book
- **POST** `/isbn/register` 🔒 - Register ISBN with agency
- **POST** `/isbn/validate` - Validate ISBN format

## Royalty System

### Key Endpoints
- **POST** `/royalty/calculate` 🔒 - Calculate royalty split
- **POST** `/royalty/splits` 🔒 - Add royalty split
- **GET** `/royalty/history` 🔒 - Get payment history

## Distribution

### Key Endpoints
- **POST** `/distribution/distribute` 🔒 - Distribute to retailers
- **GET** `/distribution/status/:bookId` 🔒 - Check status

## Recommendations

### Key Endpoints
- **GET** `/recommendations/personalized` 🔒 - Get recommendations
- **GET** `/recommendations/trending` - Get trending books
- **GET** `/recommendations/similar/:bookId` - Get similar books

## Reviews

### Key Endpoints
- **POST** `/reviews` 🔒 - Create review
- **GET** `/reviews/book/:bookId` - Get book reviews
- **PUT** `/reviews/:id` 🔒 - Update review
- **DELETE** `/reviews/:id` 🔒 - Delete review

🔒 = Requires authentication

For complete API documentation with request/response examples, see the full documentation.

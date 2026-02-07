# Deployment Guide

## Prerequisites

- Node.js 16+ installed
- PostgreSQL 12+ installed and running
- Ethereum wallet and Infura/Alchemy account for blockchain features
- API keys for IngramSpark and/or Lulu (optional for testing)
- Stripe account for payment processing (optional for testing)

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/tap919/Book-Publishing-Platform.git
cd Book-Publishing-Platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE book_publishing_platform;

# Exit psql
\q
```

#### Run Schema
```bash
psql -U postgres -d book_publishing_platform -f database/schema.sql
```

#### Seed Sample Data (Optional)
```bash
node database/seed.js
```

### 4. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=book_publishing_platform
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_random_secret_key_min_32_chars

# Blockchain (Optional for testing)
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0x_your_deployed_contract_address
PRIVATE_KEY=your_private_key_without_0x_prefix

# POD Services (Optional for testing)
INGRAM_API_KEY=your_key
INGRAM_API_SECRET=your_secret
INGRAM_API_URL=https://api.ingramcontent.com

LULU_API_KEY=your_key
LULU_API_URL=https://api.lulu.com

# Stripe (Optional for testing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 5. Create Upload Directory
```bash
mkdir -p uploads/covers uploads/manuscripts
```

### 6. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "author"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned token for authenticated requests.

## Production Deployment

### Option 1: Traditional Hosting (VPS/Dedicated Server)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx (for reverse proxy)
sudo apt install nginx
```

#### 2. Application Setup
```bash
# Clone repository
git clone https://github.com/tap919/Book-Publishing-Platform.git
cd Book-Publishing-Platform

# Install dependencies
npm install --production

# Set up environment
cp .env.example .env
nano .env  # Edit with production values
```

#### 3. Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start backend/server.js --name book-platform

# Configure auto-restart
pm2 startup
pm2 save
```

#### 4. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 5. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "backend/server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: book_publishing_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped

volumes:
  postgres-data:
```

#### Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 3: Cloud Platforms

#### Heroku
```bash
# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku run psql $DATABASE_URL < database/schema.sql
```

#### AWS (Elastic Beanstalk)
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

#### Digital Ocean App Platform
1. Connect GitHub repository
2. Configure build settings
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

## Database Management

### Backup
```bash
# Local backup
pg_dump -U postgres book_publishing_platform > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres book_publishing_platform < backup_20260207.sql
```

### Migrations
For schema updates, create migration files:
```bash
# Example migration
psql -U postgres book_publishing_platform < database/migrations/001_add_column.sql
```

## Monitoring

### Application Logs
```bash
# PM2 logs
pm2 logs book-platform

# View errors only
pm2 logs book-platform --err
```

### Database Monitoring
```sql
-- Active connections
SELECT * FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size('book_publishing_platform'));

-- Table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public';
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (min 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall (UFW/iptables)
- [ ] Regular security updates
- [ ] Database connection encryption
- [ ] API rate limiting
- [ ] Input validation
- [ ] Secure blockchain private keys

## Performance Optimization

1. **Database Indexes**: Already included in schema
2. **Connection Pooling**: Configure in `database.js`
3. **Caching**: Add Redis for session storage
4. **CDN**: Use CloudFlare for static assets
5. **Compression**: Enable gzip in Express
6. **Load Balancing**: Use Nginx or cloud LB

## Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Permission Issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /path/to/app

# Fix uploads directory
chmod 755 uploads
```

## Support

For deployment issues:
- GitHub Issues: https://github.com/tap919/Book-Publishing-Platform/issues
- Documentation: `/docs` directory
- Email: support@bookpublishingplatform.com

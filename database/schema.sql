-- Database Schema for Book Publishing Platform

-- Users table (Authors, Publishers, Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('author', 'publisher', 'admin')),
    wallet_address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    isbn VARCHAR(13) UNIQUE,
    isbn_status VARCHAR(20) DEFAULT 'pending',
    manuscript_file VARCHAR(500),
    cover_image VARCHAR(500),
    genre VARCHAR(100),
    language VARCHAR(50) DEFAULT 'English',
    page_count INTEGER,
    word_count INTEGER,
    price DECIMAL(10, 2),
    royalty_rate DECIMAL(5, 2) DEFAULT 70.00,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'formatting', 'review', 'published', 'archived')),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book metadata for distribution
CREATE TABLE book_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    keywords TEXT[],
    categories TEXT[],
    bisac_codes TEXT[],
    target_audience VARCHAR(50),
    reading_age VARCHAR(50),
    publication_date DATE,
    publisher_name VARCHAR(255),
    copyright_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ISBN management
CREATE TABLE isbns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn VARCHAR(13) UNIQUE NOT NULL,
    book_id UUID REFERENCES books(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'registered')),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_at TIMESTAMP
);

-- Print-on-Demand orders
CREATE TABLE pod_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id),
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2),
    total_cost DECIMAL(10, 2),
    shipping_address TEXT,
    pod_provider VARCHAR(50) CHECK (pod_provider IN ('ingram', 'lulu', 'internal')),
    provider_order_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'printing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Royalty splits (for co-authors, illustrators, etc.)
CREATE TABLE royalty_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    split_percentage DECIMAL(5, 2) NOT NULL,
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales and royalty payments
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id),
    order_id UUID REFERENCES pod_orders(id),
    sale_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2),
    royalty_amount DECIMAL(10, 2),
    payment_method VARCHAR(50),
    blockchain_tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Royalty payments tracking
CREATE TABLE royalty_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    blockchain_tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Retailer distribution
CREATE TABLE retailer_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    retailer_name VARCHAR(100) NOT NULL,
    retailer_api_endpoint VARCHAR(500),
    distribution_status VARCHAR(20) DEFAULT 'pending' CHECK (distribution_status IN ('pending', 'submitted', 'approved', 'active', 'rejected')),
    retailer_book_id VARCHAR(255),
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cover templates
CREATE TABLE cover_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    thumbnail_url VARCHAR(500),
    template_file VARCHAR(500),
    is_premium BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing services
CREATE TABLE marketing_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    service_type VARCHAR(50) CHECK (service_type IN ('promotion', 'advertising', 'email_campaign', 'social_media', 'book_review')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Author marketing subscriptions
CREATE TABLE author_marketing_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES marketing_services(id),
    book_id UUID REFERENCES books(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP
);

-- Genre tags and tagging
CREATE TABLE genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    parent_genre_id UUID REFERENCES genres(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book_genres (
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, genre_id)
);

-- Community curation (reviews, ratings)
CREATE TABLE book_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommendation tracking
CREATE TABLE user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    book_id UUID REFERENCES books(id),
    interaction_type VARCHAR(50) CHECK (interaction_type IN ('view', 'favorite', 'purchase', 'review')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_books_author ON books(author_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_sales_book ON sales(book_id);
CREATE INDEX idx_royalty_payments_user ON royalty_payments(user_id);
CREATE INDEX idx_pod_orders_book ON pod_orders(book_id);
CREATE INDEX idx_user_interactions_user ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_book ON user_interactions(book_id);

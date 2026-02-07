const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * ISBN Service - Manages ISBN registration and assignment
 */
class ISBNService {
  constructor() {
    this.apiKey = process.env.ISBN_API_KEY;
    this.agency = process.env.ISBN_AGENCY;
  }

  /**
   * Generate ISBN-13 using agency prefix
   */
  generateISBN() {
    // ISBN-13 format: 978-<agency>-<unique>-<check>
    const prefix = '978';
    const agencyCode = this.agency || '1234567';
    const unique = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Calculate check digit
    const partial = prefix + agencyCode + unique;
    const checkDigit = this.calculateCheckDigit(partial);
    
    return partial + checkDigit;
  }

  /**
   * Calculate ISBN-13 check digit
   */
  calculateCheckDigit(isbn12) {
    let sum = 0;
    for (let i = 0; i < isbn12.length; i++) {
      const digit = parseInt(isbn12[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const remainder = sum % 10;
    return remainder === 0 ? '0' : (10 - remainder).toString();
  }

  /**
   * Validate ISBN-13 format
   */
  validateISBN(isbn) {
    if (!isbn || isbn.length !== 13) {
      return false;
    }

    const checkDigit = isbn.slice(-1);
    const calculated = this.calculateCheckDigit(isbn.slice(0, 12));
    
    return checkDigit === calculated;
  }

  /**
   * Register ISBN with official agency (simulated)
   */
  async registerISBN(isbn, bookMetadata) {
    try {
      // In production, this would call actual ISBN agency API
      // For now, we simulate the registration
      console.log('Registering ISBN:', isbn);
      console.log('Book metadata:', bookMetadata);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        isbn,
        registrationId: uuidv4(),
        registeredAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Retrieve ISBN metadata from registry
   */
  async getISBNMetadata(isbn) {
    try {
      // In production, query actual ISBN database
      // For now, return basic info
      return {
        success: true,
        isbn,
        status: 'registered',
        format: 'paperback',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Batch purchase ISBNs for the platform
   */
  async purchaseISBNBatch(quantity = 10) {
    const isbns = [];
    
    for (let i = 0; i < quantity; i++) {
      const isbn = this.generateISBN();
      isbns.push({
        isbn,
        status: 'available',
        purchasedAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      isbns,
      quantity,
    };
  }
}

module.exports = new ISBNService();

const axios = require('axios');

/**
 * POD Service - Handles integration with Print-on-Demand providers
 * Supports IngramSpark and Lulu white-label integration
 */
class PODService {
  constructor() {
    this.providers = {
      ingram: {
        apiKey: process.env.INGRAM_API_KEY,
        apiSecret: process.env.INGRAM_API_SECRET,
        baseUrl: process.env.INGRAM_API_URL,
      },
      lulu: {
        apiKey: process.env.LULU_API_KEY,
        baseUrl: process.env.LULU_API_URL,
      },
    };
  }

  /**
   * Create a print job with IngramSpark
   */
  async createIngramOrder(bookData, orderDetails) {
    try {
      const response = await axios.post(
        `${this.providers.ingram.baseUrl}/orders`,
        {
          isbn: bookData.isbn,
          quantity: orderDetails.quantity,
          shippingAddress: orderDetails.shippingAddress,
          trimSize: bookData.trimSize || '6x9',
          paperType: bookData.paperType || 'white',
          bindingType: bookData.bindingType || 'perfectbound',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.ingram.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        orderId: response.data.orderId,
        estimatedCost: response.data.totalCost,
        estimatedDelivery: response.data.estimatedDelivery,
        provider: 'ingram',
      };
    } catch (error) {
      console.error('Ingram order failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a print job with Lulu
   */
  async createLuluOrder(bookData, orderDetails) {
    try {
      const response = await axios.post(
        `${this.providers.lulu.baseUrl}/print-jobs`,
        {
          line_items: [{
            title: bookData.title,
            cover: bookData.coverUrl,
            interior: bookData.manuscriptUrl,
            pod_package_id: bookData.podPackageId || 'standard',
            quantity: orderDetails.quantity,
          }],
          shipping_address: orderDetails.shippingAddress,
          shipping_level: orderDetails.shippingLevel || 'MAIL',
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.lulu.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        orderId: response.data.id,
        estimatedCost: response.data.total_cost_incl_tax,
        estimatedDelivery: response.data.estimated_shipping_dates?.arrival,
        provider: 'lulu',
      };
    } catch (error) {
      console.error('Lulu order failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate printing cost based on book specifications
   */
  calculatePrintingCost(pageCount, quantity, provider = 'ingram') {
    // Base costs vary by provider
    const baseCosts = {
      ingram: {
        setup: 0.85,
        perPage: 0.012,
        coverColor: 0.60,
      },
      lulu: {
        setup: 0.90,
        perPage: 0.013,
        coverColor: 0.50,
      },
    };

    const cost = baseCosts[provider];
    const unitCost = cost.setup + (pageCount * cost.perPage) + cost.coverColor;
    const totalCost = unitCost * quantity;

    // Volume discounts
    let discount = 0;
    if (quantity >= 100) discount = 0.15;
    else if (quantity >= 50) discount = 0.10;
    else if (quantity >= 20) discount = 0.05;

    return {
      unitCost: unitCost.toFixed(2),
      totalCost: (totalCost * (1 - discount)).toFixed(2),
      discount: (discount * 100).toFixed(0) + '%',
    };
  }

  /**
   * Get order status from provider
   */
  async getOrderStatus(orderId, provider) {
    try {
      const providerConfig = this.providers[provider];
      const response = await axios.get(
        `${providerConfig.baseUrl}/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${providerConfig.apiKey}`,
          },
        }
      );

      return {
        success: true,
        status: response.data.status,
        trackingNumber: response.data.trackingNumber,
        estimatedDelivery: response.data.estimatedDelivery,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Choose best POD provider based on cost and availability
   */
  async selectBestProvider(bookData, orderDetails) {
    const ingramCost = this.calculatePrintingCost(
      bookData.pageCount,
      orderDetails.quantity,
      'ingram'
    );
    const luluCost = this.calculatePrintingCost(
      bookData.pageCount,
      orderDetails.quantity,
      'lulu'
    );

    // Simple cost comparison - can be extended with availability checks
    return parseFloat(ingramCost.totalCost) <= parseFloat(luluCost.totalCost)
      ? 'ingram'
      : 'lulu';
  }
}

module.exports = new PODService();

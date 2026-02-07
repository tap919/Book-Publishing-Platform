const { Web3 } = require('web3');

/**
 * Blockchain Royalty Service
 * Handles transparent, instant royalty payments via Ethereum blockchain
 */
class BlockchainRoyaltyService {
  constructor() {
    this.web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL);
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.privateKey = process.env.PRIVATE_KEY;
    
    // Smart contract ABI for royalty payments
    this.contractABI = [
      {
        "inputs": [
          {"type": "address", "name": "recipient"},
          {"type": "uint256", "name": "amount"},
          {"type": "string", "name": "bookId"}
        ],
        "name": "payRoyalty",
        "outputs": [{"type": "bool"}],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [{"type": "string", "name": "bookId"}],
        "name": "getRoyaltyHistory",
        "outputs": [{
          "type": "tuple[]",
          "components": [
            {"type": "address", "name": "recipient"},
            {"type": "uint256", "name": "amount"},
            {"type": "uint256", "name": "timestamp"}
          ]
        }],
        "stateMutability": "view",
        "type": "function"
      }
    ];
  }

  /**
   * Convert USD to Wei (smallest Ethereum unit)
   */
  usdToWei(usdAmount) {
    // In production, fetch real-time ETH/USD rate
    const ethUsdRate = 2500; // Example rate
    const ethAmount = usdAmount / ethUsdRate;
    return this.web3.utils.toWei(ethAmount.toString(), 'ether');
  }

  /**
   * Pay royalty to author's wallet via blockchain
   */
  async payRoyalty(recipientAddress, amountUSD, bookId, metadata = {}) {
    try {
      const account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
      this.web3.eth.accounts.wallet.add(account);

      const contract = new this.web3.eth.Contract(
        this.contractABI,
        this.contractAddress
      );

      const amountWei = this.usdToWei(amountUSD);

      const tx = contract.methods.payRoyalty(
        recipientAddress,
        amountWei,
        bookId
      );

      const gas = await tx.estimateGas({ from: account.address, value: amountWei });
      const gasPrice = await this.web3.eth.getGasPrice();

      const receipt = await tx.send({
        from: account.address,
        gas: gas,
        gasPrice: gasPrice,
        value: amountWei,
      });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        amountUSD,
        recipient: recipientAddress,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Blockchain payment failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Pay multiple royalty recipients (for split royalties)
   */
  async payMultipleRoyalties(payments) {
    const results = [];
    
    for (const payment of payments) {
      const result = await this.payRoyalty(
        payment.recipientAddress,
        payment.amount,
        payment.bookId,
        payment.metadata
      );
      results.push({
        ...result,
        userId: payment.userId,
      });
    }

    return {
      success: results.every(r => r.success),
      payments: results,
      totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
    };
  }

  /**
   * Get royalty payment history for a book
   */
  async getRoyaltyHistory(bookId) {
    try {
      const contract = new this.web3.eth.Contract(
        this.contractABI,
        this.contractAddress
      );

      const history = await contract.methods.getRoyaltyHistory(bookId).call();

      return {
        success: true,
        history: history.map(entry => ({
          recipient: entry.recipient,
          amount: this.web3.utils.fromWei(entry.amount, 'ether'),
          timestamp: new Date(entry.timestamp * 1000).toISOString(),
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify wallet address format
   */
  isValidAddress(address) {
    return this.web3.utils.isAddress(address);
  }

  /**
   * Get wallet balance
   */
  async getBalance(address) {
    try {
      const balance = await this.web3.eth.getBalance(address);
      return {
        success: true,
        balance: this.web3.utils.fromWei(balance, 'ether'),
        balanceWei: balance,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate platform fee (lower than Amazon's 30-65%)
   */
  calculateFees(saleAmount) {
    const platformFeeRate = 0.15; // 15% instead of Amazon's 30-65%
    const platformFee = saleAmount * platformFeeRate;
    const authorRoyalty = saleAmount - platformFee;

    return {
      saleAmount,
      platformFee,
      platformFeeRate: platformFeeRate * 100 + '%',
      authorRoyalty,
      authorRoyaltyRate: ((authorRoyalty / saleAmount) * 100).toFixed(1) + '%',
    };
  }
}

module.exports = new BlockchainRoyaltyService();

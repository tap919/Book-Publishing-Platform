// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title BookRoyaltyContract
 * @dev Smart contract for transparent, instant royalty payments to authors
 */
contract BookRoyaltyContract {
    
    struct RoyaltyPayment {
        address recipient;
        uint256 amount;
        uint256 timestamp;
        string bookId;
        bool processed;
    }
    
    struct Book {
        string bookId;
        address author;
        uint256 totalRoyalties;
        uint256 totalSales;
        bool active;
    }
    
    mapping(string => Book) public books;
    mapping(string => RoyaltyPayment[]) public bookRoyaltyHistory;
    mapping(address => uint256) public authorBalances;
    
    address public platformOwner;
    uint256 public platformFeePercentage = 15; // 15% platform fee
    
    event BookRegistered(string bookId, address author);
    event RoyaltyPaid(string bookId, address recipient, uint256 amount, uint256 timestamp);
    event RoyaltyWithdrawn(address author, uint256 amount);
    event PlatformFeeUpdated(uint256 newFee);
    
    modifier onlyPlatformOwner() {
        require(msg.sender == platformOwner, "Only platform owner can call this");
        _;
    }
    
    modifier bookExists(string memory bookId) {
        require(books[bookId].active, "Book not registered");
        _;
    }
    
    constructor() {
        platformOwner = msg.sender;
    }
    
    /**
     * @dev Register a new book in the system
     */
    function registerBook(string memory bookId, address author) external onlyPlatformOwner {
        require(!books[bookId].active, "Book already registered");
        require(author != address(0), "Invalid author address");
        
        books[bookId] = Book({
            bookId: bookId,
            author: author,
            totalRoyalties: 0,
            totalSales: 0,
            active: true
        });
        
        emit BookRegistered(bookId, author);
    }
    
    /**
     * @dev Pay royalty to author (or split among multiple recipients)
     */
    function payRoyalty(
        string memory bookId,
        address payable recipient,
        uint256 amount
    ) external payable bookExists(bookId) onlyPlatformOwner {
        require(recipient != address(0), "Invalid recipient");
        require(msg.value == amount, "Incorrect payment amount");
        require(amount > 0, "Amount must be greater than 0");
        
        // Calculate platform fee
        uint256 platformFee = (amount * platformFeePercentage) / 100;
        uint256 royaltyAmount = amount - platformFee;
        
        // Update book statistics
        books[bookId].totalRoyalties += royaltyAmount;
        books[bookId].totalSales += amount;
        
        // Add to author balance
        authorBalances[recipient] += royaltyAmount;
        
        // Record payment
        bookRoyaltyHistory[bookId].push(RoyaltyPayment({
            recipient: recipient,
            amount: royaltyAmount,
            timestamp: block.timestamp,
            bookId: bookId,
            processed: true
        }));
        
        emit RoyaltyPaid(bookId, recipient, royaltyAmount, block.timestamp);
    }
    
    /**
     * @dev Author withdraws accumulated royalties
     */
    function withdrawRoyalties() external {
        uint256 balance = authorBalances[msg.sender];
        require(balance > 0, "No royalties to withdraw");
        
        authorBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
        
        emit RoyaltyWithdrawn(msg.sender, balance);
    }
    
    /**
     * @dev Get royalty history for a book
     */
    function getRoyaltyHistory(string memory bookId) 
        external 
        view 
        bookExists(bookId) 
        returns (RoyaltyPayment[] memory) 
    {
        return bookRoyaltyHistory[bookId];
    }
    
    /**
     * @dev Get book details
     */
    function getBook(string memory bookId) 
        external 
        view 
        bookExists(bookId) 
        returns (
            string memory,
            address,
            uint256,
            uint256,
            bool
        ) 
    {
        Book memory book = books[bookId];
        return (
            book.bookId,
            book.author,
            book.totalRoyalties,
            book.totalSales,
            book.active
        );
    }
    
    /**
     * @dev Get author balance
     */
    function getAuthorBalance(address author) external view returns (uint256) {
        return authorBalances[author];
    }
    
    /**
     * @dev Update platform fee (owner only)
     */
    function updatePlatformFee(uint256 newFee) external onlyPlatformOwner {
        require(newFee <= 30, "Fee cannot exceed 30%");
        platformFeePercentage = newFee;
        emit PlatformFeeUpdated(newFee);
    }
    
    /**
     * @dev Withdraw platform fees (owner only)
     */
    function withdrawPlatformFees() external onlyPlatformOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(platformOwner).transfer(balance);
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

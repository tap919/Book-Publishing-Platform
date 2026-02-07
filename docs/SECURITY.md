# Security

## Overview

This document outlines the security measures implemented in the Book Publishing Platform and best practices for maintaining security.

## Recent Security Fixes

### Multer DoS Vulnerabilities (Fixed: Feb 2026)

**Issue**: Multiple Denial of Service vulnerabilities in multer versions < 2.0.2
- CVE: Multer vulnerable to DoS via unhandled exceptions from malformed requests
- CVE: Multer vulnerable to DoS via memory leaks from unclosed streams
- CVE: Multer vulnerable to DoS from maliciously crafted requests

**Resolution**: 
- Updated multer from 1.4.5-lts.1 to 2.0.2
- Added enhanced file type validation
- Implemented strict file limits (max 2 files, max 10 fields)
- Added comprehensive error handling for multer errors

**Affected Files**:
- `package.json` - Updated dependency
- `backend/routes/books.js` - Added file validation and limits
- `backend/server.js` - Added multer error handling middleware

## Security Features

### 1. Authentication & Authorization

**JWT-based Authentication**
- Tokens expire after 7 days
- Strong JWT secrets required (min 32 characters)
- Bcrypt password hashing with salt rounds

**Role-Based Access Control**
- Author, Publisher, and Admin roles
- Route-level authorization checks
- User ownership verification for resources

**Implementation**:
```javascript
// JWT secret must be strong
JWT_SECRET=your_random_32_character_secret_key

// Password hashing
bcrypt.hash(password, 10)
```

### 2. Database Security

**SQL Injection Prevention**
- All queries use parameterized statements
- No string concatenation in SQL queries
- Input validation before database operations

**Example**:
```javascript
// Good - Parameterized query
db.query('SELECT * FROM books WHERE id = $1', [bookId])

// Bad - Never do this
db.query(`SELECT * FROM books WHERE id = '${bookId}'`)
```

**Connection Security**
- Connection pooling with limits
- Database credentials in environment variables
- SSL connections recommended for production

### 3. File Upload Security

**Multer Configuration** (Updated for security)
- Maximum file size: 50MB
- Maximum files per request: 2
- Maximum fields: 10
- Allowed file types only: PDF, DOC, DOCX, TXT, RTF, JPG, PNG

**File Validation**:
```javascript
fileFilter: (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
}
```

**Error Handling**:
- Specific error messages for different multer errors
- Proper cleanup of failed uploads
- Size limit enforcement

### 4. Blockchain Security

**Private Key Management**
- Private keys stored in environment variables
- Never commit private keys to repository
- Use separate keys for development/production

**Transaction Verification**
- Gas estimation before transactions
- Transaction receipt validation
- Error handling for failed transactions

**Wallet Validation**:
```javascript
isValidAddress(address) {
  return web3.utils.isAddress(address);
}
```

### 5. API Security

**CORS Configuration**
- Restricted origins
- Credentials support enabled
- Configured in environment

**Rate Limiting** (Recommended)
```javascript
// Future implementation recommended
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**Input Validation**
- Required field validation
- Type checking
- Range validation
- Format validation (email, ISBN, etc.)

### 6. Environment Variables

**Required Security Variables**:
```env
# Strong JWT secret (min 32 chars)
JWT_SECRET=your_very_long_random_secret_key

# Database credentials
DB_PASSWORD=strong_database_password

# Blockchain private key (no 0x prefix)
PRIVATE_KEY=your_private_key

# API keys (never commit)
INGRAM_API_KEY=your_key
LULU_API_KEY=your_key
STRIPE_SECRET_KEY=sk_...
```

**Best Practices**:
- Never commit `.env` file
- Use different credentials for dev/prod
- Rotate secrets regularly
- Use strong, random passwords

### 7. Error Handling

**Security-Aware Error Messages**
- Don't expose sensitive information in errors
- Log detailed errors server-side
- Return generic errors to clients

**Example**:
```javascript
try {
  // Operation
} catch (error) {
  console.error('Detailed error:', error); // Server log
  res.status(500).json({ 
    error: 'Operation failed' // Generic client message
  });
}
```

## Security Checklist

### Development
- [ ] Use environment variables for secrets
- [ ] Never commit API keys or passwords
- [ ] Use parameterized SQL queries
- [ ] Validate all user inputs
- [ ] Implement proper error handling
- [ ] Keep dependencies updated
- [ ] Review code for security issues

### Production Deployment
- [ ] Use strong, unique passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Enable database connection encryption
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use environment-specific secrets
- [ ] Enable security headers
- [ ] Set up monitoring and alerts
- [ ] Regular security audits
- [ ] Backup encryption

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Rotate API keys quarterly
- [ ] Review access logs
- [ ] Update SSL certificates
- [ ] Security penetration testing
- [ ] Code security reviews

## Vulnerability Disclosure

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to: security@bookpublishingplatform.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Headers (Recommended)

Add helmet.js for security headers:

```javascript
const helmet = require('helmet');
app.use(helmet());
```

Headers to configure:
- `Content-Security-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Strict-Transport-Security`

## Additional Security Measures

### 1. Password Policy
- Minimum 8 characters
- Require uppercase, lowercase, numbers
- Password strength validation
- Password reset with email verification

### 2. Account Security
- Email verification on signup
- Two-factor authentication (future)
- Account lockout after failed attempts
- Session management

### 3. Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Secure cookie attributes
- Data retention policies

### 4. Monitoring
- Log suspicious activities
- Monitor failed login attempts
- Track API abuse
- Alert on unusual patterns

### 5. Compliance
- GDPR compliance for EU users
- Data privacy policies
- Terms of service
- Cookie consent

## Dependencies Security

### Automated Scanning
Run security audits regularly:

```bash
# NPM audit
npm audit

# Fix vulnerabilities
npm audit fix

# Check for updates
npm outdated
```

### Dependency Management
- Review dependency advisories
- Update to patched versions promptly
- Remove unused dependencies
- Use trusted sources only

## Blockchain Security

### Smart Contract
- Audited contract code
- Upgradeable pattern (if needed)
- Access control modifiers
- Reentrancy guards
- Integer overflow protection

### Transaction Security
- Gas limit validation
- Transaction signing
- Nonce management
- Error recovery

## Incident Response

### If Security Breach Occurs:

1. **Immediate Actions**:
   - Isolate affected systems
   - Preserve logs
   - Assess impact
   - Notify stakeholders

2. **Investigation**:
   - Identify vulnerability
   - Determine scope
   - Document findings
   - Fix root cause

3. **Recovery**:
   - Apply patches
   - Restore from backups
   - Reset credentials
   - Monitor for further issues

4. **Post-Incident**:
   - Update security measures
   - Document lessons learned
   - Improve processes
   - Notify affected users (if required)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [NPM Security](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)

## Contact

For security concerns: security@bookpublishingplatform.com

---

*Last Updated: February 2026*
*Security is everyone's responsibility - report issues promptly*

# Contributing to Book Publishing Platform

Thank you for your interest in contributing! This platform aims to empower independent authors by providing an alternative to Amazon with better royalties and transparent blockchain payments.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Book-Publishing-Platform.git`
3. Add upstream remote: `git remote add upstream https://github.com/tap919/Book-Publishing-Platform.git`
4. Follow the [Quick Start Guide](QUICKSTART.md) to set up your development environment

## Development Setup

```bash
# Install dependencies
npm install

# Set up database
createdb book_publishing_platform
psql book_publishing_platform < database/schema.sql
npm run seed

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

## How to Contribute

### Reporting Bugs

Before creating a bug report:
- Check existing issues to avoid duplicates
- Collect relevant information (error messages, logs, environment)

Create a detailed bug report including:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, etc.)

### Suggesting Features

We welcome feature suggestions! Please:
- Check existing issues for similar suggestions
- Provide clear use cases
- Explain how it benefits authors/users
- Consider implementation complexity

### Code Contributions

Areas where we need help:
- **Frontend Development**: React UI for the platform
- **Testing**: Unit and integration tests
- **Documentation**: API docs, tutorials, guides
- **POD Integrations**: Additional print providers
- **Retailer APIs**: More distribution channels
- **Blockchain**: Smart contract improvements
- **Analytics**: Author dashboard features
- **Mobile**: iOS/Android apps
- **Localization**: Multi-language support

## Coding Standards

### JavaScript Style

- Use ES6+ features
- Consistent indentation (2 spaces)
- Meaningful variable names
- Add comments for complex logic
- Use async/await over callbacks

Example:
```javascript
// Good
async function calculateRoyalty(saleAmount, splits) {
  const fees = calculateFees(saleAmount);
  return distributeToRecipients(fees, splits);
}

// Avoid
function calcRoy(amt, s) {
  // unclear, no async
}
```

### Database Queries

- Use parameterized queries (prevent SQL injection)
- Handle errors properly
- Use transactions for multi-step operations

Example:
```javascript
// Good
const result = await db.query(
  'SELECT * FROM books WHERE id = $1',
  [bookId]
);

// Bad - SQL injection risk
const result = await db.query(
  `SELECT * FROM books WHERE id = '${bookId}'`
);
```

### API Design

- Follow RESTful conventions
- Use appropriate HTTP methods
- Return consistent error formats
- Include proper status codes
- Validate inputs

### Security

- Never commit secrets or API keys
- Validate and sanitize all inputs
- Use parameterized queries
- Implement rate limiting
- Follow OWASP best practices

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(royalty): add blockchain payment verification

Implement transaction verification for blockchain royalty payments
to ensure all payments are confirmed on-chain before marking as completed.

Closes #123
```

```
fix(pod): correct cost calculation for bulk orders

Volume discounts were not being applied correctly for orders over 100 units.
Updated calculation logic to properly apply tiered discounts.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update from upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests** (when available):
   ```bash
   npm test
   ```

3. **Lint your code**:
   ```bash
   npm run lint
   ```

4. **Test manually**: Verify your changes work as expected

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List specific changes
- Include relevant details

## Testing Done
- Describe how you tested
- Include test cases covered

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex sections
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests (if applicable)
- [ ] All tests pass
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

## Development Areas

### High Priority
- [ ] Frontend React application
- [ ] Comprehensive test suite
- [ ] Enhanced error handling
- [ ] Rate limiting implementation
- [ ] Caching layer (Redis)

### Medium Priority
- [ ] Additional POD providers
- [ ] More retailer integrations
- [ ] Advanced analytics dashboard
- [ ] Email notification system
- [ ] Payment gateway alternatives

### Future Enhancements
- [ ] Mobile applications
- [ ] AI-powered editing tools
- [ ] Audiobook support
- [ ] Multi-language platform
- [ ] Author community features

## Questions?

- Check the [documentation](docs/)
- Review [existing issues](https://github.com/tap919/Book-Publishing-Platform/issues)
- Join discussions in pull requests
- Ask questions in issue comments

## Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Recognized in the community

Thank you for helping build a platform that puts authors first! 🎉

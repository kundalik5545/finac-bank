# Playwright Automation Testing Framework

This is a comprehensive Playwright automation testing framework for the Finac Bank personal finance management application. The framework follows Page Object Model (POM) pattern with data-driven testing using JSON files.

## Features

- **Page Object Model**: All selectors stored in POM classes for maintainability
- **Data-Driven Testing**: Test data stored in JSON files for easy maintenance
- **Base Class**: Common functionality in BasePage for code reuse
- **Utility Libraries**: Reusable helper functions (logger, date, currency, fileUtils)
- **Multiple Environments**: Dev, QA, Prod configurations
- **Comprehensive Reports**: HTML and Allure reports
- **CI/CD Integration**: GitHub Actions workflow
- **Parallel Execution**: Configured for faster test runs
- **Screenshots/Videos**: Automatic capture on failures
- **API Testing**: Separate API test suite

## Project Structure

```
automation_testing/
├── tests/
│   ├── ui/              # UI test cases
│   ├── api/             # API test cases
│   └── e2e/             # End-to-end test cases
├── pages/               # Page Object Model files
├── fixtures/            # Test fixtures and data helpers
├── helpers/             # Utility methods
├── config/              # Playwright configurations
├── reports/             # Test reports (gitignored)
├── test-data/           # JSON files for data-driven testing
├── lib/                 # Common utilities
└── .github/             # CI/CD workflows
```

## Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- Playwright browsers

## Installation

1. Navigate to the automation_testing directory:
```bash
cd automation_testing
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

4. Install Allure (optional, for Allure reports):
```bash
npm install -g allure-commandline
```

## Configuration

### Environment Variables

Create a `.env` file in the `automation_testing` directory:

```env
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Test123!
ENV=dev
```

### Playwright Configuration

The main configuration file is `config/playwright.config.js`. Environment-specific configs are available:
- `config/dev.config.js` - Development environment
- `config/qa.config.js` - QA environment
- `config/prod.config.js` - Production environment

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in UI mode
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run tests for specific environment
```bash
npm run test:dev    # Development
npm run test:qa     # QA
npm run test:prod   # Production
```

### Run specific test suites
```bash
npm run test:api    # API tests only
npm run test:e2e    # E2E tests only
```

### Run specific test file
```bash
npx playwright test tests/ui/auth/login.spec.js
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Reports

### HTML Report
```bash
npm run report
```
Opens the HTML report in your browser.

### Allure Report
```bash
npm run report:allure
```
Generates and opens Allure report.

Reports are generated in:
- `reports/html-report/` - HTML reports
- `reports/allure-results/` - Allure results
- `reports/allure-report/` - Generated Allure report

## Test Structure

### Page Object Model (POM)

All page objects extend `BasePage` and store selectors as constants:

```javascript
export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = {
      emailInput: '//input[@type="email"]',
      passwordInput: '//input[@type="password"]',
      signInButton: '//button[contains(text(), "Sign In")]',
    };
  }
}
```

### Test Data

Test data is stored in JSON files under `test-data/`:
- `users.json` - User credentials and validation data
- `bankAccounts.json` - Bank account test data
- `transactions.json` - Transaction test data
- `categories.json` - Category test data
- `budgets.json` - Budget test data
- `investments.json` - Investment test data

### Writing Tests

Example test using POM and test data:

```javascript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage.js';
import { TestDataHelper } from '../../fixtures/testData.js';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const usersData = TestDataHelper.getUsersData();
  const user = usersData.validUsers[0];
  
  await loginPage.navigateToLogin();
  await loginPage.login(user.email, user.password);
  await loginPage.waitForLoginSuccess();
  
  await expect(page).toHaveURL(/\/dashboard/);
});
```

## Utilities

### Logger
Structured logging with levels (debug, info, warn, error):
```javascript
import { logger } from '../lib/logger.js';
logger.info('Test started');
logger.error('Test failed');
```

### Date Utilities
Date manipulation helpers:
```javascript
import { formatDate, getCurrentMonth, getCurrentYear } from '../lib/date.js';
const date = formatDate(new Date());
const month = getCurrentMonth();
```

### Currency Utilities
Currency formatting and validation:
```javascript
import { formatCurrency, isValidAmount } from '../lib/currency.js';
const formatted = formatCurrency(1000, 'INR');
const isValid = isValidAmount(100);
```

### File Utilities
JSON file operations:
```javascript
import { loadTestData, readJSONFile } from '../lib/fileUtils.js';
const data = loadTestData('users.json');
```

## CI/CD

### GitHub Actions

The framework includes a GitHub Actions workflow (`.github/workflows/playwright.yml`) that:
- Runs tests on push/PR to main/develop branches
- Generates HTML and Allure reports
- Uploads test artifacts
- Supports parallel test execution

### Secrets Configuration

Configure the following secrets in GitHub:
- `BASE_URL` - Application base URL
- `API_BASE_URL` - API base URL
- `TEST_USER_EMAIL` - Test user email
- `TEST_USER_PASSWORD` - Test user password

## Best Practices

1. **Use Page Object Model**: Store all selectors in POM classes
2. **Data-Driven Tests**: Use JSON files for test data
3. **Reusable Utilities**: Use helper functions from `lib/` and `helpers/`
4. **Proper Waits**: Use custom wait helpers instead of hardcoded timeouts
5. **Error Handling**: Use try-catch blocks and proper error messages
6. **Test Isolation**: Each test should be independent
7. **Clean Up**: Clean up test data after tests

## Troubleshooting

### Tests failing with timeout
- Increase timeout in `playwright.config.js`
- Check if application is running
- Verify selectors are correct

### Browser not launching
- Run `npx playwright install`
- Check browser permissions

### Reports not generating
- Ensure Allure is installed: `npm install -g allure-commandline`
- Check report directory permissions

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update test data files as needed
4. Update documentation

## License

ISC


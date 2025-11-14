<!-- b5be00cc-7fa0-4ec2-83d2-893d9a7c4284 f1aa43a4-976e-4831-b3bd-11ee876f3e7b -->
# Playwright Automation Testing Framework Setup

## Overview

Create a complete Playwright testing framework in the `automation_testing` folder with Page Object Model pattern, data-driven testing, and comprehensive test coverage for the Finac Bank finance application.

## Folder Structure

```
automation_testing/
├── tests/
│   ├── ui/
│   │   ├── auth/
│   │   │   ├── login.spec.js
│   │   │   └── signup.spec.js
│   │   ├── dashboard.spec.js
│   │   ├── bank-account.spec.js
│   │   ├── transactions.spec.js
│   │   ├── categories.spec.js
│   │   ├── budgets.spec.js
│   │   ├── investments.spec.js
│   │   ├── assets.spec.js
│   │   └── recurring-transactions.spec.js
│   ├── api/
│   │   ├── auth.api.spec.js
│   │   ├── bank-accounts.api.spec.js
│   │   ├── transactions.api.spec.js
│   │   ├── categories.api.spec.js
│   │   └── budgets.api.spec.js
│   └── e2e/
│       ├── full-journey.spec.js
│       └── user-workflow.spec.js
├── pages/               # Page Object Model files
│   ├── BasePage.js      # Base class with common methods
│   ├── LoginPage.js
│   ├── SignUpPage.js
│   ├── DashboardPage.js
│   ├── BankAccountPage.js
│   ├── TransactionsPage.js
│   ├── CategoriesPage.js
│   ├── BudgetsPage.js
│   ├── InvestmentsPage.js
│   └── AssetsPage.js
├── fixtures/            # Test fixtures
│   ├── testUser.js      # Test user credentials
│   └── testData.js      # Common test data helpers
├── helpers/             # Utility methods
│   ├── apiClient.js     # API request helpers
│   ├── wait.js          # Custom wait utilities
│   └── assertions.js    # Custom assertion helpers
├── config/
│   ├── playwright.config.js    # Main Playwright config
│   ├── dev.config.js            # Dev environment config
│   ├── qa.config.js             # QA environment config
│   └── prod.config.js           # Prod environment config
├── reports/             # Test Reports
│   ├── html-report/     # HTML reports (gitignored)
│   └── allure-results/ # Allure results (gitignored)
├── test-data/           # JSON files for data-driven testing
│   ├── users.json
│   ├── bankAccounts.json
│   ├── transactions.json
│   ├── categories.json
│   ├── budgets.json
│   └── investments.json
├── lib/                 # Common utilities
│   ├── logger.js        # Logging utility
│   ├── date.js          # Date manipulation utilities
│   ├── currency.js       # Currency formatting utilities
│   └── fileUtils.js     # File operations utilities
├── .github/             # CI/CD
│   └── workflows/
│       └── playwright.yml
├── package.json
├── README.md
└── .gitignore
```

## Implementation Details

### 1. Configuration Files

**playwright.config.js**

- Configure Playwright with multiple browsers (Chromium, Firefox, WebKit)
- Set up test timeout, retries, and workers
- Configure HTML reporter and Allure reporter
- Set up base URL from environment variables
- Configure screenshot and video on failure
- Set up global setup/teardown hooks

**Environment Configs (dev.config.js, qa.config.js, prod.config.js)**

- Base URLs for each environment
- API endpoints
- Test user credentials per environment
- Database connection strings (if needed)

### 2. Base Classes

**BasePage.js**

- Common methods: `navigate()`, `waitForElement()`, `click()`, `type()`, `getText()`
- Screenshot capture on errors
- Common wait strategies
- Element visibility checks
- Form submission helpers

### 3. Page Object Model Classes

Each POM class will:

- Store all XPath/CSS selectors as constants
- Implement page-specific actions
- Return page objects for method chaining
- Handle page-specific waits and validations

**Key POM Classes:**

- `LoginPage.js`: Login form selectors and actions
- `SignUpPage.js`: Registration form selectors and actions
- `DashboardPage.js`: Dashboard elements and navigation
- `BankAccountPage.js`: Bank account CRUD operations
- `TransactionsPage.js`: Transaction creation, filtering, editing
- `CategoriesPage.js`: Category management
- `BudgetsPage.js`: Budget creation and management
- `InvestmentsPage.js`: Investment tracking
- `AssetsPage.js`: Asset management

### 4. Test Data (JSON Files)

**users.json**

```json
{
  "validUsers": [
    {"email": "test@example.com", "password": "Test123!", "name": "Test User"},
    ...
  ],
  "invalidUsers": [
    {"email": "invalid@test.com", "password": "wrong", "error": "Invalid credentials"},
    ...
  ]
}
```

**bankAccounts.json**

- Test data for creating bank accounts
- Different account types (BANK, WALLET, CASH, CREDIT_CARD)
- Valid and invalid scenarios

**transactions.json**

- Transaction test data (INCOME, EXPENSE, TRANSFER, INVESTMENT)
- Different payment methods
- Various amounts and currencies

### 5. Test Classes

**UI Tests (tests/ui/)**

- `login.spec.js`: Login validation, error handling, successful login
- `signup.spec.js`: Registration validation, password requirements
- `dashboard.spec.js`: Dashboard elements visibility, navigation
- `bank-account.spec.js`: CRUD operations for bank accounts
- `transactions.spec.js`: Transaction creation, filtering, editing, deletion
- `categories.spec.js`: Category management, subcategories
- `budgets.spec.js`: Budget creation, alerts, tracking
- `investments.spec.js`: Investment CRUD, analytics
- `assets.spec.js`: Asset management

**API Tests (tests/api/)**

- Test all API endpoints
- Validate request/response schemas
- Test error handling
- Authentication token management

**E2E Tests (tests/e2e/)**

- Complete user workflows
- Multi-page interactions
- Data consistency across pages

### 6. Utility Libraries (lib/)

**logger.js**

- Structured logging with levels (info, warn, error, debug)
- Log to console and files
- Timestamp formatting

**date.js**

- Date formatting utilities
- Date manipulation for test data
- Relative date calculations

**currency.js**

- Currency formatting
- Amount validation
- Currency conversion helpers

**fileUtils.js**

- JSON file reading/writing
- Test data loading
- Report file management

### 7. Helpers

**apiClient.js**

- HTTP request wrappers (GET, POST, PUT, DELETE)
- Authentication token management
- Response validation
- Error handling

**wait.js**

- Custom wait conditions
- Element visibility waits
- Network idle waits
- API response waits

**assertions.js**

- Custom assertion helpers
- Form validation assertions
- Data comparison utilities

### 8. Test Reports

**HTML Reporter**

- Built-in Playwright HTML reporter
- Screenshots and videos on failure
- Test execution timeline

**Allure Reporter**

- Install @playwright/test and allure-playwright
- Generate Allure reports
- Rich test history and trends
- Attach screenshots and videos

### 9. CI/CD Setup

**GitHub Actions Workflow**

- Run tests on push/PR
- Generate and publish HTML reports
- Generate Allure reports
- Test across multiple browsers
- Parallel test execution

### 10. Package.json Scripts

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:dev": "playwright test --config=config/dev.config.js",
    "test:qa": "playwright test --config=config/qa.config.js",
    "test:prod": "playwright test --config=config/prod.config.js",
    "test:api": "playwright test tests/api",
    "test:e2e": "playwright test tests/e2e",
    "report": "playwright show-report",
    "report:allure": "allure generate reports/allure-results --clean -o reports/allure-report && allure open reports/allure-report"
  }
}
```

## Key Features

1. **Page Object Model**: All selectors stored in POM classes
2. **Data-Driven Testing**: JSON files for test data
3. **Base Class**: Common functionality in BasePage
4. **Utility Libraries**: Reusable helper functions
5. **Multiple Environments**: Dev, QA, Prod configs
6. **Comprehensive Reports**: HTML and Allure reports
7. **CI/CD Integration**: GitHub Actions workflow
8. **Parallel Execution**: Configure workers for faster runs
9. **Screenshots/Videos**: Capture on failures
10. **API Testing**: Separate API test suite

## Dependencies

- @playwright/test (latest)
- allure-playwright
- dotenv (for environment variables)

## Implementation Steps

1. Initialize Playwright project structure
2. Create configuration files (playwright.config.js, environment configs)
3. Set up BasePage class with common methods
4. Create POM classes for each page (store all XPaths)
5. Create JSON test data files
6. Implement utility libraries (logger, date, currency, fileUtils)
7. Create helper functions (apiClient, wait, assertions)
8. Write UI test cases using data-driven approach
9. Write API test cases
10. Write E2E test cases
11. Set up HTML and Allure reporting
12. Configure CI/CD workflow
13. Create README with usage instructions

### To-dos

- [ ] Initialize Playwright project: create folder structure, install dependencies (@playwright/test, allure-playwright, dotenv), create package.json with test scripts
- [ ] Create configuration files: playwright.config.js with HTML/Allure reporters, dev.config.js, qa.config.js, prod.config.js with environment-specific settings
- [ ] Create BasePage.js with common methods (navigate, waitForElement, click, type, getText, screenshot capture, form helpers)
- [ ] Create POM classes: LoginPage.js, SignUpPage.js, DashboardPage.js, BankAccountPage.js, TransactionsPage.js, CategoriesPage.js, BudgetsPage.js, InvestmentsPage.js, AssetsPage.js - store all XPaths as constants
- [ ] Create JSON test data files: users.json, bankAccounts.json, transactions.json, categories.json, budgets.json, investments.json with valid/invalid test scenarios
- [ ] Create lib utilities: logger.js (structured logging), date.js (date manipulation), currency.js (currency formatting), fileUtils.js (JSON file operations)
- [ ] Create helper functions: apiClient.js (HTTP wrappers, auth token management), wait.js (custom wait conditions), assertions.js (custom assertions)
- [ ] Write UI test cases: login.spec.js, signup.spec.js, dashboard.spec.js, bank-account.spec.js, transactions.spec.js, categories.spec.js, budgets.spec.js using data-driven approach from JSON files
- [ ] Write API test cases: auth.api.spec.js, bank-accounts.api.spec.js, transactions.api.spec.js, categories.api.spec.js, budgets.api.spec.js - test all endpoints with validation
- [ ] Write E2E test cases: full-journey.spec.js (complete user workflow from signup to transaction creation), user-workflow.spec.js (multi-page interactions)
- [ ] Configure HTML and Allure reporting: update playwright.config.js for report generation, create report generation scripts, test report generation
- [ ] Create GitHub Actions workflow: .github/workflows/playwright.yml with test execution, report generation, and artifact uploads
- [ ] Create README.md with project overview, setup instructions, running tests, test structure explanation, and CI/CD usage
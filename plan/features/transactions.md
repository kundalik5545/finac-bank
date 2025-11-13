# Transaction Management System with Filters and Export

## Overview

Implement a transaction management system with advanced filtering, search, statistics dashboard, and CSV export functionality. The system will allow users to view, filter, search, and export their financial transactions with comprehensive statistics.

## Current State Analysis

### Existing Files

- **Transaction Page**: `app/(main)/transactions/page.jsx` (placeholder)
- **Transaction Schema**: Complete with all relations (BankAccount, Category, SubCategory, etc.)
- **Transaction Enums**: INCOME, EXPENSE, TRANSFER, INVESTMENT (types), PENDING, COMPLETED, FAILED (status), UPI, CASH, CARD, ONLINE, OTHER (payment methods)

### Transaction Model Fields

- `id`, `amount`, `currency`, `type`, `status`, `date`, `description`, `comments`, `isActive`
- Relations: `bankAccountId`, `categoryId`, `subCategoryId`, `paymentMethod`, `budgetId`, `recurringTransactionId`

## Implementation Plan

### 1. Create Transaction API Routes (`app/api/transactions/`)

**Create Route Files:**

- `app/api/transactions/route.js` - Handle GET (list with filters) and POST (create)
- `app/api/transactions/[id]/route.js` - Handle GET (by id), PATCH (update), DELETE
- `app/api/transactions/export/route.js` - Handle GET (export to CSV)

**API Endpoints:**

**GET /api/transactions** - Get transactions with filters

- Query Parameters:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `dateFrom` (optional): Start date (ISO string)
- `dateTo` (optional): End date (ISO string)
- `bankAccountId` (optional): Filter by bank account ID
- `categoryId` (optional): Filter by category ID
- `subCategoryId` (optional): Filter by sub-category ID
- `type` (optional): Filter by transaction type (INCOME, EXPENSE, TRANSFER, INVESTMENT)
- `status` (optional): Filter by status (PENDING, COMPLETED, FAILED)
- `paymentMethod` (optional): Filter by payment method (UPI, CASH, CARD, ONLINE, OTHER)
- `amountMin` (optional): Minimum amount filter
- `amountMax` (optional): Maximum amount filter
- `search` (optional): Search in description and comments
- `sortBy` (optional): Sort field (date, amount) (default: date)
- `sortOrder` (optional): Sort order (asc, desc) (default: desc)
- Response: `{ transactions: Transaction[], total: number, page: number, limit: number, stats: TransactionStats }`

**POST /api/transactions** - Create new transaction

- Request Body: Transaction data (validated with Zod)
- Response: `{ transaction: Transaction }`
- Status: 201 on success

**GET /api/transactions/[id]** - Get single transaction

- Response: `{ transaction: Transaction }`
- Status: 200 on success, 404 if not found

**PATCH /api/transactions/[id]** - Update transaction

- Request Body: Partial transaction data
- Response: `{ transaction: Transaction }`
- Status: 200 on success, 404 if not found

**DELETE /api/transactions/[id]** - Delete transaction (soft delete: set isActive=false)

- Response: `{ message: string }`
- Status: 200 on success, 404 if not found

**GET /api/transactions/export** - Export filtered transactions to CSV

- Query Parameters: Same as GET /api/transactions (all filter parameters)
- Response: CSV file download
- Headers: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="transactions-YYYY-MM-DD.csv"`

**Transaction Statistics (included in GET response):**

- `totalCount`: Total number of transactions matching filters
- `totalIncome`: Sum of INCOME transactions
- `totalExpense`: Sum of EXPENSE transactions
- `totalTransfer`: Sum of TRANSFER transactions
- `totalInvestment`: Sum of INVESTMENT transactions
- `netAmount`: Total income - total expense
- `byType`: Count and sum grouped by transaction type
- `byStatus`: Count grouped by status
- `byCategory`: Top categories with counts and sums
- `byPaymentMethod`: Count and sum grouped by payment method
- `dateRange`: Min and max dates in filtered results

### 2. Create Transaction Form Schema (`lib/formSchema.js`)

**Add Schemas:**

- `transactionSchema`: For creating transactions
- `updateTransactionSchema`: For updating transactions
- `transactionFilterSchema`: For validating filter parameters

### 3. Update Transaction Main Page (`app/(main)/transactions/page.jsx`)

**Structure:**

- Server Component wrapper
- Fetch initial data (transactions, bank accounts, categories for filters)
- Pass data to client components
- Handle loading and error states

**Components to Include:**

- FilterPanel (client component)
- TransactionTable (client component)
- TransactionStats (client component)
- ExportButton (client component)

### 4. Create Filter Panel Component (`app/(main)/transactions/_components/FilterPanel.jsx`)

**Filter Options:**

- **Date Range**: Date picker for from/to dates
- **Bank Account**: Multi-select dropdown (fetch from API)
- **Category**: Multi-select dropdown (fetch from API)
- **Sub-Category**: Multi-select dropdown (depends on selected category)
- **Transaction Type**: Multi-select (INCOME, EXPENSE, TRANSFER, INVESTMENT)
- **Status**: Multi-select (PENDING, COMPLETED, FAILED)
- **Payment Method**: Multi-select (UPI, CASH, CARD, ONLINE, OTHER)
- **Amount Range**: Min and max amount inputs
- **Search**: Text input for description/comments search
- **Sort By**: Select (Date, Amount)
- **Sort Order**: Select (Ascending, Descending)
- **Active Only**: Checkbox to show only active transactions

**Features:**

- Collapsible filter panel (can be expanded/collapsed)
- "Clear All Filters" button
- "Apply Filters" button
- Show active filter count badge
- URL state management (sync filters with URL query params)
- Debounced search input

### 5. Create Transaction Table Component (`app/(main)/transactions/_components/TransactionTable.jsx`)

**Table Columns:**

- Date (formatted)
- Description
- Category (with sub-category if available)
- Bank Account (name)
- Type (with color coding: green for INCOME, red for EXPENSE, blue for TRANSFER, purple for INVESTMENT)
- Amount (formatted currency, color coded by type)
- Status (badge with color: yellow for PENDING, green for COMPLETED, red for FAILED)
- Payment Method (badge)
- Actions (View Details, Edit, Delete)

**Features:**

- Pagination controls (if using server-side pagination)
- Loading skeleton while fetching
- Empty state when no transactions
- Responsive design (mobile-friendly)
- Row click to view details
- Sortable columns (if needed)
- Bulk actions (select multiple, delete)

### 6. Create Transaction Stats Component (`app/(main)/transactions/_components/TransactionStats.jsx`)

**Statistics Cards:**

- **Total Transactions**: Count of filtered transactions
- **Total Income**: Sum of INCOME type (green)
- **Total Expense**: Sum of EXPENSE type (red)
- **Net Amount**: Income - Expense (color coded: green if positive, red if negative)
- **Total Transfer**: Sum of TRANSFER type
- **Total Investment**: Sum of INVESTMENT type

**Additional Stats:**

- **By Type Chart**: Pie or bar chart showing distribution by type
- **By Status**: Count breakdown (PENDING, COMPLETED, FAILED)
- **By Payment Method**: Distribution chart
- **Top Categories**: List of top 5 categories by amount
- **Date Range**: Display the filtered date range

**Features:**

- Real-time updates when filters change
- Color-coded cards
- Icons for each stat
- Responsive grid layout

### 7. Create Export Functionality

**Export Button Component:**

- Button in header/toolbar
- On click: Call `/api/transactions/export` with current filter params
- Show loading state during export
- Download CSV file with proper filename

**CSV Format:**

- Headers: Date, Description, Category, Sub-Category, Bank Account, Type, Amount, Status, Payment Method, Comments
- Include all filtered transactions
- Proper date formatting
- Currency formatting
- Handle special characters in CSV

### 8. Update Transaction Add Page (`app/(main)/transactions/add/page.jsx`)

**Update to:**

- Use new transaction schema
- Submit to POST /api/transactions
- Include all transaction fields
- Pre-select active account if available
- Form validation with React Hook Form + Zod

### 9. Update Transaction Details Page (`app/(main)/transactions/details/[id]/page.jsx`)

**Update to:**

- Fetch transaction from GET /api/transactions/[id]
- Display all transaction details
- Show related information (bank account, category, etc.)
- Add Edit and Delete buttons
- Handle 404 errors

### 10. Create Transaction Edit Page (`app/(main)/transactions/edit/[id]/page.jsx`)

**New File:**

- Server Component to fetch transaction
- Client Component form (similar to add page)
- Pre-populate form with existing data
- Submit to PATCH /api/transactions/[id]
- Handle validation and errors

## File Structure

### Files to Create

1. `app/api/transactions/route.js` - GET (list), POST (create)
2. `app/api/transactions/[id]/route.js` - GET, PATCH, DELETE
3. `app/api/transactions/export/route.js` - GET (CSV export)
4. `app/(main)/transactions/_components/FilterPanel.jsx` - Filter UI
5. `app/(main)/transactions/_components/TransactionTable.jsx` - Table component
6. `app/(main)/transactions/_components/TransactionStats.jsx` - Statistics component
7. `app/(main)/transactions/_components/ExportButton.jsx` - Export button
8. `app/(main)/transactions/edit/[id]/page.jsx` - Edit form page
9. `app/(main)/transactions/edit/[id]/_components/EditTransactionForm.jsx` - Edit form component

### Files to Modify

1. `app/(main)/transactions/page.jsx` - Main transaction page
2. `app/(main)/transactions/add/page.jsx` - Update add form
3. `app/(main)/transactions/details/[id]/page.jsx` - Update details page
4. `lib/formSchema.js` - Add transaction schemas

## Technical Implementation Details

### API Route Implementation

**Filtering Logic:**

- Build Prisma where clause dynamically based on query parameters
- Handle date range filtering (dateFrom, dateTo)
- Handle multiple values for multi-select filters (use `in` operator)
- Handle amount range (gte, lte)
- Handle text search (description, comments using `contains` with case-insensitive)
- Handle pagination (skip, take)
- Handle sorting (orderBy)

**Statistics Calculation:**

- Use Prisma aggregation functions (`_count`, `_sum`, `_avg`)
- Group by type, status, category, payment method
- Calculate totals for each group
- Return comprehensive stats object

**CSV Export:**

- Use a CSV library (e.g., `papaparse` or native implementation)
- Stream response for large datasets
- Include all filter parameters in filename
- Properly escape CSV values
- Set correct headers for file download

### Frontend Implementation

**State Management:**

- Use URL search params for filter state (shareable links)
- Use React state for UI state (loading, errors)
- Debounce search input (300ms)
- Cache filter options (bank accounts, categories)

**Data Fetching:**

- Use fetch API with query parameters
- Handle loading states
- Handle error states
- Implement pagination (client-side or server-side)
- Refresh data when filters change

**Performance Optimizations:**

- Debounce search input
- Lazy load filter options
- Virtual scrolling for large tables (if needed)
- Memoize expensive calculations
- Cache API responses

## UI/UX Features

### Filter Panel

- Collapsible/expandable design
- Sticky on scroll (optional)
- Show active filter count
- Quick filter presets (Today, This Week, This Month, This Year, All Time)
- Save filter presets (future enhancement)

### Transaction Table

- Color-coded rows by type
- Hover effects
- Click to view details
- Inline editing (future enhancement)
- Bulk selection and actions
- Export selected rows (future enhancement)

### Statistics Dashboard

- Real-time updates
- Animated number changes
- Charts for visual representation
- Responsive cards
- Tooltips for additional info

### Export Feature

- Progress indicator for large exports
- Success notification
- Error handling
- File naming with date and filters

## Database Considerations

- Ensure proper indexes on filtered fields (date, bankAccountId, categoryId, type, status)
- Use efficient queries (avoid N+1 problems)
- Consider pagination for large datasets
- Use transactions for bulk operations
- Handle soft deletes (isActive field)

## Error Handling

- Validate all filter parameters
- Handle invalid date ranges
- Handle missing relations (deleted bank accounts, categories)
- Provide user-friendly error messages
- Log errors for debugging

## Security Considerations

- Authenticate all API requests
- Verify user owns the transactions being accessed
- Validate all input data
- Sanitize CSV export data
- Rate limit export endpoint (prevent abuse)

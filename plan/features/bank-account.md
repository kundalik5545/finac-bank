# Bank Account CRUD Routes and Features (API Routes)

## Overview

Implement complete CRUD operations for bank accounts using Next.js API routes with features for managing primary/active accounts, displaying total balance, and showing active account indicators in the UI.

## Current State Analysis

### Existing Files

- **Routes**: `/bank-account` (list), `/bank-account/add` (form exists), `/bank-account/details/[id]` (details page)
- **Actions**: `action/bank-account.js` (has addBankAccount but uses incorrect field names)
- **Components**: `BankCard.jsx`, `BankTable.jsx` (currently use mock data)
- **Schema**: BankAccount model has `isActive`, `isPrimary`, `balance`, `name`, `type`, `currency`, etc.
- **API Pattern**: Existing API route at `app/api/auth/[...all]/route.js` shows Next.js route handler pattern

### Issues to Fix

1. Action uses wrong field names (`bankName` vs `name`, `accountNumber` vs `bankAccount`, etc.)
2. Pages use mock data instead of fetching from database
3. Missing edit and delete functionality
4. No active account management
5. No total balance calculation
6. No visual indicators for active/primary accounts

## Implementation Plan

### 1. Create API Routes (`app/api/bank-accounts/`)

**Create Route Files:**

- `app/api/bank-accounts/route.js` - Handle GET (list all) and POST (create)
- `app/api/bank-accounts/[id]/route.js` - Handle GET (by id), PATCH (update), DELETE
- `app/api/bank-accounts/[id]/primary/route.js` - Handle PATCH (set primary)
- `app/api/bank-accounts/[id]/active/route.js` - Handle PATCH (set active)

**API Endpoints:**

- `GET /api/bank-accounts` - Get all bank accounts for authenticated user
- `POST /api/bank-accounts` - Create new bank account
- `GET /api/bank-accounts/[id]` - Get single bank account by ID
- `PATCH /api/bank-accounts/[id]` - Update bank account
- `DELETE /api/bank-accounts/[id]` - Delete bank account (soft or hard)
- `PATCH /api/bank-accounts/[id]/primary` - Set account as primary
- `PATCH /api/bank-accounts/[id]/active` - Set account as active for transactions

**Key Implementation Details:**

- Use `auth.api.getSession({ headers: await headers() })` for authentication
- Return JSON responses with proper HTTP status codes
- Fix field name mapping to match Prisma schema (`name` not `bankName`, `bankAccount` not `accountNumber`, `ifscCode` not `iFSC_Code`)
- Validate request body with Zod schemas
- Handle errors with try-catch and return appropriate error responses
- Ensure only one primary account per user (unset others when setting new primary)
- Update `UserPreference.defaultAccountId` when setting active account

### 2. Update Main Bank Account Page (`app/(main)/bank-account/page.jsx`)

**Changes:**

- Convert to Server Component (remove mock data)
- Fetch bank accounts using `fetch('/api/bank-accounts')` or use Server Component fetch
- Calculate and display total balance from fetched accounts
- Pass real data to `BankCard` and `BankTable` components
- Handle loading and error states

### 3. Update BankCard Component (`app/(main)/bank-account/_components/BankCard.jsx`)

**Changes:**

- Accept real bank account data structure
- Show active account indicator (badge, border highlight, or icon)
- Show primary account indicator (star icon or badge)
- Map account data to card display format
- Handle missing optional fields gracefully
- Add visual distinction for active accounts (border, glow, or badge)

### 4. Update BankTable Component (`app/(main)/bank-account/_components/BankTable.jsx`)

**Changes:**

- Convert to Client Component (if not already) for interactivity
- Accept real bank account data
- Add checkbox column for setting primary account
- Add active/inactive status indicator
- Add edit and delete action buttons with handlers
- Show total balance in footer (calculated from active accounts)
- Highlight active account row with special styling
- Make primary checkbox functional (calls `PATCH /api/bank-accounts/[id]/primary`)
- Use fetch API for all mutations
- Show toast notifications for success/error (use sonner)

### 5. Update Add Bank Account Page (`app/(main)/bank-account/add/page.jsx`)

**Changes:**

- Keep as Client Component for form handling
- Fix form field names to match schema
- Use React Hook Form with Zod validation
- Update form submission to POST to `/api/bank-accounts`
- Add isActive checkbox (default true)
- Add isPrimary checkbox
- Handle form submission with fetch API
- Show loading state during submission
- Redirect after successful creation
- Display error messages from API response

### 6. Create Edit Bank Account Page (`app/(main)/bank-account/edit/[id]/page.jsx`)

**New File:**

- Server Component wrapper to fetch account by ID
- Client Component for form (or use same pattern as add page)
- Pre-populate form with existing data from API
- Use same form structure as add page
- Submit to `PATCH /api/bank-accounts/[id]`
- Handle not found errors (404)
- Redirect after successful update
- Show loading and error states

### 7. Update Details Page (`app/(main)/bank-account/details/[id]/page.jsx`)

**Changes:**

- Convert to Server Component for initial data fetch
- Fetch account data using `GET /api/bank-accounts/[id]`
- Display actual account information
- Add edit button linking to edit page
- Add delete button with confirmation dialog
- Show active/primary status indicators
- Fetch and display related transactions (if needed)
- Handle 404 errors gracefully

### 8. Add Delete Functionality

**Implementation:**

- Add delete confirmation dialog (use shadcn/ui AlertDialog)
- Call `DELETE /api/bank-accounts/[id]` endpoint
- Handle soft delete (set isActive=false) or hard delete based on API response
- Refresh data after deletion (or use router.refresh())
- Show toast notification on success/error
- Handle errors appropriately

### 9. Add Active Account Management

**Implementation:**

- Add "Set as Active" button/checkbox in table or details page
- Call `PATCH /api/bank-accounts/[id]/active` endpoint
- API route updates `UserPreference.defaultAccountId` when setting active account
- Show active account with special styling (border, badge, or icon)
- Display active account indicator in BankCard and BankTable
- Update UI immediately after setting active account

### 10. Update Form Schema (`lib/formSchema.js`)

**Changes:**

- Update `addBankSchema` to match Prisma schema field names
- Add `updateBankSchema` for edit operations
- Ensure validation matches database constraints
- Use for both client-side validation and API route validation

## File Changes Summary

### Files to Create

1. `app/api/bank-accounts/route.js` - GET (list), POST (create)
2. `app/api/bank-accounts/[id]/route.js` - GET, PATCH, DELETE
3. `app/api/bank-accounts/[id]/primary/route.js` - PATCH (set primary)
4. `app/api/bank-accounts/[id]/active/route.js` - PATCH (set active)
5. `app/(main)/bank-account/edit/[id]/page.jsx` - Edit form page

### Files to Modify

1. `app/(main)/bank-account/page.jsx` - Fetch from API, display real data
2. `app/(main)/bank-account/_components/BankCard.jsx` - Handle real data, add indicators
3. `app/(main)/bank-account/_components/BankTable.jsx` - Add checkboxes, actions, API calls
4. `app/(main)/bank-account/add/page.jsx` - Fix form fields, use API route
5. `app/(main)/bank-account/details/[id]/page.jsx` - Fetch from API, add actions
6. `lib/formSchema.js` - Update schemas to match Prisma schema

## API Route Structure

### Request/Response Patterns

**GET /api/bank-accounts**

- Response: `{ accounts: BankAccount[], totalBalance: number }`
- Status: 200 on success, 401 if unauthorized

**POST /api/bank-accounts**

- Request Body: Bank account data (validated with Zod)
- Response: `{ account: BankAccount }`
- Status: 201 on success, 400 on validation error, 401 if unauthorized

**GET /api/bank-accounts/[id]**

- Response: `{ account: BankAccount }`
- Status: 200 on success, 404 if not found, 401 if unauthorized

**PATCH /api/bank-accounts/[id]**

- Request Body: Partial bank account data
- Response: `{ account: BankAccount }`
- Status: 200 on success, 400 on validation error, 404 if not found, 401 if unauthorized

**DELETE /api/bank-accounts/[id]**

- Response: `{ message: string }`
- Status: 200 on success, 404 if not found, 401 if unauthorized

**PATCH /api/bank-accounts/[id]/primary**

- Response: `{ account: BankAccount }`
- Status: 200 on success, 404 if not found, 401 if unauthorized

**PATCH /api/bank-accounts/[id]/active**

- Response: `{ account: BankAccount, preferences: UserPreference }`
- Status: 200 on success, 404 if not found, 401 if unauthorized

## UI/UX Enhancements

1. **Active Account Indicator**:

- Badge with "Active" text
- Special border color (e.g., green or blue)
- Icon (checkmark or star)
- Glow effect or shadow

2. **Primary Account Indicator**:

- Star icon
- "Primary" badge
- Highlighted row/card
- Different background color

3. **Total Balance Display**:

- Show in table footer
- Show as summary card on main page
- Calculate from all active accounts
- Format with currency formatter

4. **Checkbox for Primary**:

- In table row
- Only one can be checked at a time
- Auto-uncheck others when one is selected
- Show loading state during API call

## Technical Considerations

1. **Authentication**: Use `auth.api.getSession({ headers: await headers() })` in API routes
2. **Error Handling**: Return appropriate HTTP status codes and error messages
3. **Data Validation**: Use Zod schemas in API routes for request validation
4. **Type Safety**: Ensure field names match Prisma schema exactly
5. **User Preferences**: Store active account in `UserPreference.defaultAccountId`
6. **Caching**: Consider using Next.js cache or revalidation for GET requests
7. **Client-Side Updates**: Use router.refresh() or state management after mutations
8. **Loading States**: Show loading indicators during API calls
9. **Error Messages**: Display user-friendly error messages from API responses
10. **Optimistic Updates**: Consider optimistic UI updates for better UX

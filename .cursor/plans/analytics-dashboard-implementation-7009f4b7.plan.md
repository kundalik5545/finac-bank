<!-- 7009f4b7-89ec-44dc-bc2a-89ee12d36e91 3c212ca4-dd88-40bd-8b2f-b27bd7f47c8e -->
# Transaction Synchronization and Balance Updates Plan

## Overview

Fix synchronization issues between transactions, bank balances, dashboard analytics, and filters. Implement automatic bank balance updates based on transaction status and type, and ensure all pages refresh when transactions change.

## Issues Identified

1. **Bank Balance Not Updated**: Transactions don't update bank account balances
2. **No Revalidation**: Dashboard and transaction pages don't refresh after changes
3. **Status Changes Not Handled**: Balance doesn't update when transaction status changes
4. **Filter Synchronization**: Filters may not reflect latest data

## Implementation Plan

### 1. Create Balance Update Utility Function

**File**: `lib/balance-utils.js`

Create a utility module with functions to:

- Calculate balance changes for transactions
- Update bank account balances atomically
- Handle rollback scenarios
- Support transaction type logic:
  - INCOME: Increase balance when COMPLETED
  - EXPENSE: Decrease balance when COMPLETED
  - TRANSFER: Handle source/destination accounts
  - INVESTMENT: Decrease balance when COMPLETED

Functions needed:

- `updateBankBalance(transaction, oldTransaction, operation)` - Main balance update logic
- `calculateBalanceChange(transaction, oldTransaction)` - Calculate delta
- `revertBalanceChange(transaction)` - Revert a transaction's balance impact

### 2. Update Transaction POST API

**File**: `app/api/transactions/route.js`

Modify POST handler to:

- After creating transaction, check if status is COMPLETED
- If COMPLETED, update bank account balance based on transaction type
- Use Prisma transaction for atomicity
- Add revalidation: `revalidatePath("/transactions")`, `revalidatePath("/dashboard")`, `revalidatePath("/bank-account")`

### 3. Update Transaction PATCH API

**File**: `app/api/transactions/[id]/route.js`

Modify PATCH handler to:

- Fetch old transaction before update
- Calculate balance changes:
  - If old status was COMPLETED: Revert old transaction's impact
  - If new status is COMPLETED: Apply new transaction's impact
  - If amount/type/bankAccountId changed: Handle all scenarios
- Handle bank account changes (if bankAccountId is updated)
- Use Prisma transaction for atomicity
- Add revalidation for all affected paths

### 4. Update Transaction DELETE API

**File**: `app/api/transactions/[id]/route.js`

Modify DELETE handler to:

- Before soft delete, check if transaction was COMPLETED
- If COMPLETED, revert balance change
- Use Prisma transaction for atomicity
- Add revalidation

### 5. Create Server Action for Balance Updates

**File**: `action/transaction-balance.js`

Create server actions:

- `updateTransactionBalance(transactionId, operation)` - Update balance for a transaction
- `recalculateAccountBalance(bankAccountId)` - Recalculate balance from all transactions (safety function)

### 6. Update Transaction Forms

**Files**:

- `app/(main)/transactions/add/page.jsx`
- `app/(main)/transactions/edit/[id]/page.jsx`

Ensure forms:

- Redirect after successful creation/update
- Use router.refresh() to trigger revalidation
- Show success/error messages

### 7. Update TransactionsClient Component

**File**: `app/(main)/transactions/_components/TransactionsClient.jsx`

Add:

- Refresh function that can be called after mutations
- Auto-refresh on successful transaction operations
- Better error handling

### 8. Update Dashboard Page

**File**: `app/(main)/dashboard/page.jsx`

Ensure:

- Uses Server Components (already done)
- Data is fresh on each load (Next.js handles this with revalidation)
- Consider adding refresh interval or manual refresh button

### 9. Handle Edge Cases

- **Status Changes**: PENDING → COMPLETED, COMPLETED → PENDING, COMPLETED → FAILED
- **Amount Changes**: When amount is updated on COMPLETED transaction
- **Type Changes**: When type changes on COMPLETED transaction
- **Bank Account Changes**: When bankAccountId changes on COMPLETED transaction
- **Multiple Updates**: Ensure atomicity with Prisma transactions
- **Concurrent Updates**: Handle race conditions

### 10. Add Balance Recalculation Utility

**File**: `lib/balance-utils.js`

Add function to recalculate balance from scratch:

- `recalculateAccountBalance(bankAccountId)` - Sum all COMPLETED transactions
- Useful for data migration or fixing inconsistencies

## Balance Update Logic

### Rules:

1. **INCOME + COMPLETED**: Add amount to balance
2. **EXPENSE + COMPLETED**: Subtract amount from balance
3. **INVESTMENT + COMPLETED**: Subtract amount from balance
4. **TRANSFER + COMPLETED**: 

   - Subtract from source account
   - Add to destination account (if different)

5. **Status != COMPLETED**: No balance impact
6. **isActive = false**: Revert balance impact

### Formula:

```
Balance Change = 
  IF status === 'COMPLETED' AND isActive === true:
    IF type === 'INCOME': +amount
    IF type === 'EXPENSE': -amount
    IF type === 'INVESTMENT': -amount
    IF type === 'TRANSFER': Handle source/destination
  ELSE: 0
```

## Revalidation Strategy

Use Next.js `revalidatePath` in API routes:

- `/transactions` - Transaction list page
- `/dashboard` - Dashboard page
- `/bank-account` - Bank account pages
- `/transactions/[id]` - Transaction detail pages

## Testing Considerations

- Test balance updates on transaction create
- Test balance updates on transaction update (all field changes)
- Test balance updates on transaction delete
- Test status changes (PENDING ↔ COMPLETED)
- Test concurrent transactions
- Test TRANSFER transactions
- Test rollback scenarios

## Database Considerations

- Use Prisma transactions for atomicity
- Ensure proper error handling and rollback
- Consider adding database constraints if needed
- May need to add balance update history/audit trail in future

### To-dos

- [ ] Create lib/balance-utils.js with balance update utility functions (updateBankBalance, calculateBalanceChange, revertBalanceChange)
- [ ] Update POST handler in app/api/transactions/route.js to update bank balance and add revalidation
- [ ] Update PATCH handler in app/api/transactions/[id]/route.js to handle balance updates on status/amount/type/account changes with revalidation
- [ ] Update DELETE handler in app/api/transactions/[id]/route.js to revert balance changes and add revalidation
- [ ] Update transaction add/edit forms to use router.refresh() after successful operations
- [ ] Update TransactionsClient to refresh data after mutations and improve error handling
- [ ] Add recalculateAccountBalance function to balance-utils.js for fixing inconsistencies
- [ ] Test all balance update scenarios: create, update, delete, status changes, type changes, account changes
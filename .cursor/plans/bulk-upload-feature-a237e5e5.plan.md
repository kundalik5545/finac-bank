<!-- a237e5e5-77c8-4ef5-904b-a220777892a5 844b2a7d-df49-4f97-8115-af95fe54ac2b -->
# Bulk Upload - Separate Category and Subcategory Implementation

## Overview

Refactor the bulk upload feature to support separate category and subcategory uploads. Users must upload categories first, then use category IDs to upload subcategories. Bulk upload is only allowed for first-time setup; existing categories can only be edited/deleted individually.

## Key Changes from Previous Implementation

1. **Separate Uploads**: Categories and subcategories are uploaded separately, not together
2. **Two-Step Process**: Upload categories first → Get category IDs → Upload subcategories with category IDs
3. **First-Time Only**: Bulk upload only works if no categories exist; otherwise use individual add/edit/delete
4. **Delete All**: Add APIs and UI buttons to delete all categories and all subcategories

## Implementation Steps

### 1. Update Excel Templates

#### Category Template (`public/sample-categories.xlsx`)

Create separate Excel file with columns:

- `name` (required) - Category name
- `type` (required) - INCOME/EXPENSE/TRANSFER/INVESTMENT
- `color` (optional) - Hex color format: #RRGGBB
- `icon` (optional) - Icon name (Lucide icon)
- Include 10 sample category records

#### Subcategory Template (`public/sample-subcategories.xlsx`)

Create separate Excel file with columns:

- `categoryId` (required) - UUID of existing category
- `name` (required) - Subcategory name
- `color` (optional) - Hex color format: #RRGGBB
- `icon` (optional) - Icon name (Lucide icon)
- Include 10 sample subcategory records with placeholder categoryIds

### 2. Update Validation Schemas (`lib/formSchema.js`)

- Remove `bulkCategoryRowSchema` (old combined schema)
- Add `bulkCategorySchema`: Array of objects with name, type, color, icon
- Add `bulkSubCategorySchema`: Array of objects with categoryId, name, color, icon
- Both schemas should validate required fields and optional fields

### 3. Rewrite Category Bulk Upload API (`app/api/categories/bulk/route.js`)

**POST /api/categories/bulk**

- Check if user already has categories - if yes, return error (first-time only)
- Parse Excel file with columns: name, type, color, icon
- Validate each row
- Create categories (skip duplicates by name+type)
- Return created categories with their IDs for subcategory upload
- Response: `{ categoriesCreated: number, categories: array, errors: array }`

### 4. Create Subcategory Bulk Upload API (`app/api/subcategories/bulk/route.js`)

**POST /api/subcategories/bulk**

- Parse Excel file with columns: categoryId, name, color, icon
- Validate categoryId exists and belongs to user
- Validate each row
- Create subcategories (skip duplicates by name+categoryId)
- Response: `{ subCategoriesCreated: number, errors: array }`

### 5. Create Delete All APIs

#### Delete All Categories API (`app/api/categories/delete-all/route.js`)

**DELETE /api/categories/delete-all**

- Delete all categories for authenticated user
- Also delete all subcategories (cascade or explicit)
- Return count of deleted items
- Response: `{ categoriesDeleted: number, subCategoriesDeleted: number }`

#### Delete All Subcategories API (`app/api/subcategories/delete-all/route.js`)

**DELETE /api/subcategories/delete-all**

- Delete all subcategories for authenticated user
- Response: `{ subCategoriesDeleted: number }`

### 6. Update Bulk Upload UI (`app/(main)/bulk-upload/page.jsx`)

**Three Tabs/Sections:**

1. **Transactions** (keep existing)
2. **Categories** (new separate section)
3. **Subcategories** (new separate section)

**Categories Tab:**

- Check if categories exist - if yes, show message: "Categories already exist. Use 'Add Category' button to add new categories, or use 'Delete All Categories' to start over."
- File upload for categories only
- Download sample-categories.xlsx
- After upload, display created categories with their IDs in a table
- "Delete All Categories" button (with confirmation dialog)

**Subcategories Tab:**

- Fetch and display existing categories with IDs
- File upload for subcategories only
- Download sample-subcategories.xlsx
- Show category selector or display category list for reference
- "Delete All Subcategories" button (with confirmation dialog)

### 7. Update Category Management Logic

- Modify category page to check if bulk upload should be allowed
- Add visual indicator if categories exist (bulk upload disabled)
- Ensure "Add Category" button works for individual additions
- Ensure edit/delete functionality works for existing categories

### 8. Error Handling

- Clear error messages for first-time-only restriction
- Validate categoryId exists in subcategory upload
- Row-level error tracking
- User-friendly error display

## Files to Create/Modify

### New Files

- `app/api/subcategories/bulk/route.js` - Subcategory bulk upload API
- `app/api/categories/delete-all/route.js` - Delete all categories API
- `app/api/subcategories/delete-all/route.js` - Delete all subcategories API
- `public/sample-categories.xlsx` - Category template (regenerate)
- `public/sample-subcategories.xlsx` - Subcategory template (new)

### Modified Files

- `app/api/categories/bulk/route.js` - Rewrite for categories only, first-time check
- `app/(main)/bulk-upload/page.jsx` - Update UI with separate tabs and delete buttons
- `lib/formSchema.js` - Update schemas for separate uploads
- Script to regenerate Excel templates

## Technical Considerations

1. **First-Time Check**: Query database to check if user has any categories before allowing bulk upload
2. **Category ID Display**: After category upload, show table with category IDs for user to copy into subcategory Excel
3. **Cascade Delete**: When deleting all categories, also delete all subcategories
4. **Confirmation Dialogs**: Use shadcn/ui dialog for delete all confirmations
5. **State Management**: Track whether categories exist to show/hide bulk upload option
6. **Excel Template Updates**: Regenerate templates with correct column structure

## User Flow

1. User goes to Bulk Upload page
2. If no categories exist:

- User can upload categories via bulk upload
- After upload, sees list of categories with IDs
- User downloads subcategory template and fills in categoryIds
- User uploads subcategories

3. If categories exist:

- Bulk upload for categories is disabled
- Message shown: "Use 'Add Category' button for new categories"
- User can still bulk upload subcategories (if categories exist)
- User can delete all categories/subcategories to start over

### To-dos

- [ ] 
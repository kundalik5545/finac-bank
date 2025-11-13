# Category and Subcategory Management Page

## Overview

Create a complete category and subcategory management system with a single page displaying categories in a table format with expandable subcategories, full CRUD operations via API routes, color pickers, and Lucide icon selectors.

## Implementation Plan

### 1. API Routes

#### Category APIs (`app/api/categories/`)

- **POST** `/api/categories` - Create new category
- **GET** `/api/categories` - Already exists, keep as is
- **PATCH** `/api/categories/[id]/route.js` - Update category
- **DELETE** `/api/categories/[id]/route.js` - Delete category

#### Subcategory APIs (`app/api/categories/[id]/subcategories/`)

- **POST** `/api/categories/[id]/subcategories` - Create subcategory
- **GET** `/api/categories/[id]/subcategories` - Already exists, keep as is
- **PATCH** `/api/categories/[id]/subcategories/[subId]/route.js` - Update subcategory
- **DELETE** `/api/categories/[id]/subcategories/[subId]/route.js` - Delete subcategory

All APIs should:

- Authenticate using `auth.api.getSession`
- Validate user ownership
- Handle errors appropriately
- Return proper JSON responses

### 2. Form Schemas (`lib/formSchema.js`)

Add validation schemas:

- `addCategorySchema` - name, type (CategoryType enum), color (optional), icon (optional)
- `updateCategorySchema` - same fields, all optional
- `addSubCategorySchema` - name, categoryId, color (optional), icon (optional)
- `updateSubCategorySchema` - same fields, all optional

### 3. Category Management Page (`app/(main)/categories/`)

#### Main Page (`page.jsx`)

- Server Component that fetches all categories with their subcategories
- Display heading with "Add Category" button
- Render `CategoriesTable` component
- Follow pattern from `app/(main)/bank-account/page.jsx`

#### Components (`_components/`)

**CategoriesTable.jsx** (Client Component)

- Display categories in a table using shadcn/ui Table component
- Each row shows: Icon, Name, Type, Color preview, Subcategories count, Actions
- Expandable rows to show subcategories inline or in nested table
- Actions: Edit, Delete, Add Subcategory
- Use pattern from `BankTable.jsx`

**CategoryForm.jsx** (Client Component)

- Form for adding/editing categories
- Fields: Name, Type (select), Icon (icon selector), Color (color picker)
- Use React Hook Form with Zod validation
- Follow pattern from `EditBankAccountForm.jsx`

**SubCategoryForm.jsx** (Client Component)

- Form for adding/editing subcategories
- Fields: Name, Icon (icon selector), Color (color picker)
- Category ID passed as prop (read-only)

**IconSelector.jsx** (Client Component)

- Searchable/dropdown component to select Lucide icons
- Display icon preview
- Use shadcn/ui Select or custom dropdown
- Common icons: ShoppingCart, Home, Car, Utensils, Heart, etc.

**ColorPicker.jsx** (Client Component)

- Simple color picker using HTML5 color input
- Display color preview
- Optional: Enhanced picker with preset colors

### 4. Navigation Update

Update `components/AppLayout/AppSidebar.jsx`:

- Add "Categories" menu item to `navMain` array
- Use `Tags` or `FolderTree` icon from lucide-react
- Link to `/categories`

### 5. Server Actions (Optional Alternative)

Alternatively, create server actions in `action/category.js`:

- `createCategory`, `updateCategory`, `deleteCategory`
- `createSubCategory`, `updateSubCategory`, `deleteSubCategory`

This follows the existing pattern but APIs are already partially implemented.

## File Structure

```
app/(main)/categories/
├── page.jsx                          # Main categories page
├── add/
│   └── page.jsx                      # Add category page
├── edit/
│   └── [id]/
│       └── page.jsx                  # Edit category page
└── _components/
    ├── CategoriesTable.jsx            # Main table component
    ├── CategoryForm.jsx               # Category form
    ├── SubCategoryForm.jsx            # Subcategory form
    ├── IconSelector.jsx               # Icon picker component
    └── ColorPicker.jsx                # Color picker component

app/api/categories/
├── route.js                           # GET (exists), POST (new)
└── [id]/
    ├── route.js                       # PATCH, DELETE (new)
    └── subcategories/
        ├── route.js                   # GET (exists), POST (new)
        └── [subId]/
            └── route.js               # PATCH, DELETE (new)
```

## Key Features

1. **Table Display**

   - Categories shown in main table
   - Subcategories expandable within category rows or separate section
   - Color swatches displayed in table
   - Icons displayed next to names

2. **Color Picker**

   - HTML5 color input for simplicity
   - Color preview swatch
   - Store as hex color string

3. **Icon Selector**

   - Dropdown/searchable list of Lucide icons
   - Icon preview
   - Store icon name as string (e.g., "ShoppingCart")

4. **CRUD Operations**

   - Create category/subcategory
   - Edit category/subcategory
   - Delete with confirmation
   - All operations via API routes

5. **User Experience**

   - Toast notifications for success/error (using sonner)
   - Loading states during operations
   - Form validation
   - Responsive design

## Technical Details

- Use existing patterns from `bank-account` and `transactions` pages
- Follow project structure: Server Components for pages, Client Components for interactivity
- Use shadcn/ui components (Table, Button, Form, Select, etc.)
- Authentication via `auth.api.getSession` in API routes
- Prisma queries with proper user filtering
- Error handling with try-catch blocks

<!-- c9d913c2-aada-4cc5-9280-d4045d9ae0b9 67f67d5a-e030-4bac-a6af-013505f43c5c -->
# User Information Section Implementation Plan

## Overview

Implement user information display in the top navbar and left sidebar by creating an API endpoint to fetch authenticated user data from the database and updating the UI components to use real data.

## Implementation Steps

### 1. Create User API Endpoint

- **File**: `app/api/user/route.js`
- Create GET endpoint that:
- Uses Better Auth to get current session (`auth.api.getSession`)
- Fetches user data from database using `session.user.id`
- Returns user fields: `id`, `name`, `email`, `image`
- Handles unauthorized requests (401)
- Handles errors gracefully (500)

### 2. Update Navbar Component

- **File**: `components/AppLayout/Navbar.jsx`
- Remove hardcoded user object (lines 31-35)
- Add state management for user data
- Add `useEffect` to fetch user data from `/api/user` on component mount
- Handle loading state (optional skeleton/placeholder)
- Handle error state gracefully
- Update Avatar fallback to use user initials from name
- Pass real user data to dropdown menu

### 3. Update AppSidebar Component

- **File**: `components/AppLayout/AppSidebar.jsx`
- Remove hardcoded user object from data (lines 32-37)
- Add state management for user data
- Add `useEffect` to fetch user data from `/api/user` on component mount
- Handle loading state (optional)
- Pass fetched user data to `NavUser` component

### 4. Update NavUser Component (Optional Enhancement)

- **File**: `components/AppLayout/NavUser.jsx`
- Update Avatar fallback to dynamically generate initials from user name
- Ensure proper handling of missing avatar image
- Keep existing dropdown menu functionality

## Technical Details

### API Endpoint Pattern

Follow existing API patterns in the codebase:

- Use `auth.api.getSession({ headers: await headers() })` for authentication
- Use `prisma.user.findUnique({ where: { id: session.user.id } })` to fetch user
- Return JSON response with proper error handling

### Data Flow

1. User authenticates via Better Auth
2. Components fetch user data from `/api/user` endpoint
3. API validates session and fetches from database
4. Components display user name, email, and avatar

### User Icon/Avatar

- Use existing `Avatar` component from shadcn/ui
- Display user image if available (`user.image` from database)
- Generate fallback initials from user name
- Use `User2` icon from lucide-react as additional visual indicator

## Files to Modify

1. `app/api/user/route.js` (new file)
2. `components/AppLayout/Navbar.jsx`
3. `components/AppLayout/AppSidebar.jsx`
4. `components/AppLayout/NavUser.jsx` (optional improvements)

## Database Fields Used

- `User.id` - User identifier
- `User.name` - User's full name
- `User.email` - User's email address
- `User.image` - User's profile image URL (optional)
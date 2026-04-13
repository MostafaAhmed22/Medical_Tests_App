# Medical Tests API Documentation

Base URL: `{{base_url}}` (e.g. `http://localhost:3000`)

Common headers:
- `Content-Type: application/json`
- `Authorization: Bearer {{token}}` for authenticated endpoints

---

## Public Endpoints

### Health / Root
- `GET /`
- Description: API health check
- Auth: none
- Request body: none
- Response: status + message

### Register
- `POST /register`
- Description: Create a new user account and send verification email
- Auth: none
- Body:
  - `name` (string, required)
  - `email` (string, required)
  - `password` (string, required)
  - `phone` (string, required)
- Response: new user data and token

### Login
- `POST /login`
- Description: Authenticate user and return JWT
- Auth: none
- Body:
  - `email` (string, required)
  - `password` (string, required)
- Response: token

### Resend verification
- `POST /resend-verification`
- Description: Resend email verification OTP
- Auth: none
- Body:
  - `email` (string, required)
- Response: success message

### Forgot password
- `POST /forgot-password`
- Description: Request password reset OTP
- Auth: none
- Body:
  - `email` (string, required)
- Response: success message

### Reset password
- `PATCH /reset-password`
- Description: Change password using OTP
- Auth: none
- Body:
  - `email` (string, required)
  - `otp` (string, required)
  - `newPassword` (string, required)
- Response: success message

### List categories
- `GET /categories`
- Description: Get all categories
- Auth: none
- Response: array of categories

### Get category by ID
- `GET /categories/:id`
- Description: Get category details by ID
- Auth: none
- Params:
  - `id` (string, required)
- Response: category object

### List tests
- `GET /tests`
- Description: Get published tests, optionally filter by category
- Auth: none
- Query:
  - `category` (string, optional)
- Response: list of tests

### Get test by ID
- `GET /tests/:id`
- Description: Get test details by ID
- Auth: none
- Params:
  - `id` (string, required)
- Response: test object

---

## Authenticated User Endpoints

### Logout
- `POST /logout`
- Description: Logout current user
- Auth: Bearer token
- Response: success message

### Refresh token
- `POST /refresh`
- Description: Refresh JWT using refresh token cookie
- Auth: Bearer token
- Response: refreshed token

### Verify email
- `POST /verify-email`
- Description: Verify user email with OTP
- Auth: Bearer token
- Body:
  - `otp` (string, required)
- Response: success message

### Change password
- `PATCH /change-password`
- Description: Change password for authenticated user
- Auth: Bearer token
- Body:
  - `currentPassword` (string, required)
  - `newPassword` (string, required)
- Response: success message

### Get profile
- `GET /me`
- Description: Get current authenticated user profile
- Auth: Bearer token
- Response: user details

### Update profile
- `PATCH /update-profile`
- Description: Update profile fields
- Auth: Bearer token
- Body:
  - `name` (string, optional)
  - `phone` (string, optional)
- Response: updated user

### View cart
- `GET /cart`
- Description: Get current authenticated user cart
- Auth: Bearer token
- Response: cart object

### Add test to cart
- `POST /cart`
- Description: Add a test to the current user's cart
- Auth: Bearer token
- Body:
  - `testId` (string, required)
- Response: updated cart

### Remove item from cart
- `DELETE /cart/items/:testId`
- Description: Remove a test from the cart
- Auth: Bearer token
- Params:
  - `testId` (string, required)
- Response: updated cart

### Clear cart
- `DELETE /cart`
- Description: Remove all items from current cart
- Auth: Bearer token
- Response: success message

### Get user orders
- `GET /orders`
- Description: Get paginated orders for current user
- Auth: Bearer token
- Query:
  - `page` (integer, optional)
  - `limit` (integer, optional)
- Response: order list and pagination

### Get order by ID
- `GET /orders/:id`
- Description: Get details of a specific order
- Auth: Bearer token
- Params:
  - `id` (string, required)
- Response: order object

### Create order
- `POST /orders`
- Description: Place an order for the current cart
- Auth: Bearer token
- Body:
  - `cartId` (string, required)
- Response: created order

### Cancel order
- `PUT /orders/:id/cancel`
- Description: Cancel a pending unpaid order
- Auth: Bearer token
- Params:
  - `id` (string, required)
- Response: cancelled order

### Mark order as paid
- `PUT /orders/:id/pay`
- Description: Mark order as paid and complete it
- Auth: Bearer token
- Params:
  - `id` (string, required)
- Response: updated order

---

## Admin Endpoints

### Create category
- `POST /categories`
- Description: Create a new category
- Auth: Bearer token
- Roles: Admin only
- Body:
  - `name` (string, required)
- Response: created category

### Update category
- `PUT /categories/:id`
- Description: Update category data
- Auth: Bearer token
- Roles: Admin only
- Params:
  - `id` (string, required)
- Body:
  - `name` (string, optional)
- Response: updated category

### Delete category
- `DELETE /categories/:id`
- Description: Delete a category if no tests exist in it
- Auth: Bearer token
- Roles: Admin only
- Params:
  - `id` (string, required)
- Response: success message

### Create test
- `POST /tests`
- Description: Create a new test
- Auth: Bearer token
- Roles: Admin only
- Body:
  - `title` (string, required)
  - `description` (string, required)
  - `category` (string, required)
  - `price` (number, required)
  - `coverImage` (string, optional)
  - `totalQuestions` (number, required)
  - `isPublished` (boolean, optional)
- Response: created test

### Update test
- `PUT /tests/:id`
- Description: Update test data
- Auth: Bearer token
- Roles: Admin only
- Params:
  - `id` (string, required)
- Body:
  - `title` (string, optional)
  - `description` (string, optional)
  - `category` (string, optional)
  - `price` (number, optional)
  - `coverImage` (string, optional)
  - `totalQuestions` (number, optional)
  - `isPublished` (boolean, optional)
- Response: updated test

### Delete test
- `DELETE /tests/:id`
- Description: Delete a test
- Auth: Bearer token
- Roles: Admin only
- Params:
  - `id` (string, required)
- Response: success message

---

## Notes
- All authenticated endpoints require `Authorization: Bearer {{token}}`.
- Current cart and order flow is user-only; guest carts are disabled.
- If the frontend wants to use pagination for orders, pass `page` and `limit` query parameters to `GET /orders`.
- Validation errors return HTTP 400 with message details.

# FocusFlow — Habit & Routine Tracker

FocusFlow helps you stay consistent with daily and weekly habits by giving you a clear checklist, streak tracking, and quick insights.

## Team

- Nursalim Onalbayev — SE-2425
- Zhalgas Torekeldi — SE-2425
- Alisher Akhmet — SE-2425

## Project Idea

Track habits, visualize streaks, and surface weekly insights so you know exactly where to focus. Each week you’ll see what’s working, what slipped, and where to improve.

## Planned Features

- Daily checklist with streaks
- Weekly summary with simple charts
- Reminders for high-priority habits
- Shareable progress snapshot

## Roadmap

- **Week 1:** Express setup, landing page, basic styling
- **Week 2:** Habit form + POST route to store entries
- **Week 3:** Connect to database for persistence
- **Week 4:** Authentication & personalized dashboards

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) - [Download MongoDB](https://www.mongodb.com/try/download/community)

### Installation Steps

1) **Install MongoDB**

   - **Windows:** Download and install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
   - **macOS:** `brew install mongodb-community`
   - **Linux:** Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

2) **Start MongoDB**

   - **Windows:** MongoDB should start automatically as a service, or run `mongod` from command prompt
   - **macOS/Linux:** `brew services start mongodb-community` or `sudo systemctl start mongod`

3) **Install dependencies**  
   ```bash
   npm install
   ```

4) **Run the server**  
   ```bash
   npm start
   ```

   The MongoDB collection (`habits`) will be created automatically on first insert.

5) **Open the app**  
   Visit `http://localhost:3000`

### Environment Variables (Optional)

You can customize the MongoDB connection URL using an environment variable:

```bash
# Default: mongodb://localhost:27017
MONGODB_URI=mongodb://localhost:27017 npm start

# Or use MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/focusflow npm start
```

## Routes

### HTML Routes

- **`/`** — Home (main page with navigation)
  - Returns: HTML page (index.html)
  - Method: GET
  - Status: 200

- **`/about`** — About page with team and project information
  - Returns: HTML page (about.html)
  - Method: GET
  - Status: 200

- **`/contact`** — Contact form page
  - Returns: HTML page (contact.html)
  - Method: GET
  - Status: 200

- **`/search`** — Search page with query parameter handling
  - Returns: HTML page (search.html)
  - Method: GET
  - Query Parameter: `q` (optional, but if provided cannot be empty)
  - Example: `/search?q=habit`
  - Validation: Returns 400 if `q` parameter is provided but empty
  - Status: 200 (or 400 if validation fails)

- **`/item/:id`** — Item details page with route parameter
  - Returns: HTML page (item.html)
  - Method: GET
  - Route Parameter: `id` (required)
  - Example: `/item/1`, `/item/habit-123`
  - Validation: Returns 400 if `id` is missing or empty
  - Status: 200 (or 400 if validation fails)

- **`/contact`** (POST) — Handle contact form submission
  - Returns: HTML thank you page
  - Method: POST
  - Body Parameters: `name` (required), `email` (required), `message` (required)
  - Validation: Returns 400 if any required parameter is missing
  - Data Saving: Saves submission to `submissions.json` file using `fs.writeFile()`
  - Status: 200 (or 400/500 if validation/saving fails)

### API Routes

- **`/api/info`** — Returns project information in JSON format
  - Returns: JSON object with project details
  - Method: GET
  - Status: 200
  - Response includes: project name, description, version, team members, available routes, technologies

#### CRUD API for Habits

- **`GET /api/habits`** — Get all habits (supports filtering, sorting, projection)
  - Returns: JSON array of all habits
  - Method: GET
  - Status: 200 OK (or 400/500 if invalid query/error)
  - Query Parameters (all optional):
    - `filter`: JSON string for MongoDB filter (e.g., `{"title": "Exercise"}`)
    - `sort`: JSON string for MongoDB sort (e.g., `{"title": 1}` or `{"created_at": -1}`)
    - `projection`: JSON string for MongoDB projection (e.g., `{"title": 1, "description": 1}`)
  - Examples:
    - `GET /api/habits` - Get all habits
    - `GET /api/habits?filter={"title":"Exercise"}` - Filter by title
    - `GET /api/habits?sort={"title":1}` - Sort by title ascending
    - `GET /api/habits?projection={"title":1,"description":1}` - Get only title and description
    - `GET /api/habits?filter={}&sort={"created_at":-1}&projection={"title":1}` - Combined

- **`GET /api/habits/:id`** — Get a single habit by id
  - Returns: JSON object with habit data
  - Method: GET
  - Status: 200 OK (or 400/404 if invalid/not found)
  - Validation: Returns 400 if id is not a valid MongoDB ObjectId
  - Example: `GET /api/habits/507f1f77bcf86cd799439011`

- **`POST /api/habits`** — Create a new habit
  - Returns: JSON object with created habit (including id)
  - Method: POST
  - Status: 201 Created (or 400/500 if validation/error)
  - Body (JSON): `{ "title": "string", "description": "string" }`
  - Validation: Returns 400 if title or description is missing
  - Example: 
    ```bash
    curl -X POST http://localhost:3000/api/habits \
      -H "Content-Type: application/json" \
      -d '{"title": "Exercise", "description": "30 minutes daily"}'
    ```

- **`PUT /api/habits/:id`** — Update an existing habit by id
  - Returns: JSON object with updated habit
  - Method: PUT
  - Status: 200 OK (or 400/404/500 if invalid/not found/error)
  - Body (JSON): `{ "title": "string", "description": "string" }`
  - Validation: Returns 400 if id is invalid ObjectId or fields are missing, 404 if habit not found
  - Example:
    ```bash
    curl -X PUT http://localhost:3000/api/habits/507f1f77bcf86cd799439011 \
      -H "Content-Type: application/json" \
      -d '{"title": "Exercise", "description": "45 minutes daily"}'
    ```

- **`DELETE /api/habits/:id`** — Delete a habit by id
  - Returns: JSON object with success message
  - Method: DELETE
  - Status: 200 OK (or 400/404/500 if invalid/not found/error)
  - Validation: Returns 400 if id is invalid ObjectId, 404 if habit not found
  - Example:
    ```bash
    curl -X DELETE http://localhost:3000/api/habits/507f1f77bcf86cd799439011
    ```

### Error Handling

- **404 Handler** — Handles unknown routes
  - Returns: HTML page (404.html) for regular pages, JSON for API routes
  - Method: Any
  - Status: 404
  - Uses `app.use()` middleware to catch all unmatched routes
  - API routes (starting with `/api`) return JSON: `{ "error": "Route not found" }`
  - Regular pages return HTML 404 page

## Middleware

### Built-in Middleware

- **`express.static()`** — Serves static files from `public/` directory
- **`express.urlencoded({ extended: true })`** — Parses URL-encoded form bodies (for POST requests)
- **`express.json()`** — Parses JSON request bodies (required for API requests)

### Custom Middleware

- **Logger Middleware** — Custom middleware that logs HTTP method and URL for every request
  - Format: `METHOD /path`
  - Example: `GET /search?q=habit`, `POST /contact`

## Contact Form

The contact page includes a form with the following fields:
- Name (input `name`) — **Required**
- Email (input `email`) — **Required**
- Message (textarea `message`) — **Required**

The server uses `express.urlencoded({ extended: true })` to parse form data. On submit:
1. Server validates that all required fields are present and non-empty
2. Returns HTTP 400 status if any required parameter is missing
3. Saves submission to `submissions.json` file using `fs.writeFile()`
4. Responds with a thank-you HTML page

## Server-side Validation

The server implements validation for the following routes:

1. **`/search`** — Returns 400 if query parameter `q` is provided but empty
2. **`/item/:id`** — Returns 400 if route parameter `id` is missing or empty
3. **`POST /contact`** — Returns 400 if any required field (`name`, `email`, `message`) is missing or empty

## Navigation

All pages include consistent navigation links in the header:
- Home (`/`)
- About (`/about`)
- Contact (`/contact`)
- Search (`/search`)

This ensures users can easily navigate between pages from any location.


## Database

### Database System
- **MongoDB** — Used for data persistence
- Database name: `focusflow`
- Collection name: `habits`
- Collection is created automatically on first insert (MongoDB behavior)

### Collection Structure

**Collection: `habits`**

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier for each habit (MongoDB default) |
| `id` | String | String representation of `_id` (for API compatibility) |
| `title` | String | Name/title of the habit (required) |
| `description` | String | Description/details of the habit (required) |
| `created_at` | Date | Timestamp when habit was created |
| `updated_at` | Date | Timestamp when habit was last updated (set on PUT) |

### MongoDB Native Driver

This project uses the **MongoDB native Node.js driver** (no Mongoose). The collection structure is flexible and can be extended with additional fields as needed.

## Project Structure

```
project-root/
├── public/
│   └── style.css
├── views/
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   ├── search.html
│   ├── item.html
│   └── 404.html
├── database/
│   └── (MongoDB connection logic in db.js)
├── routes/
│   └── (API routes in server.js)
├── db.js (MongoDB database module)
├── server.js (Express server with routes)
├── package.json
├── submissions.json (created automatically when contact form is submitted)
└── README.md
```

## Assignment 2 - Part 1 Features

This assignment demonstrates server-side request handling in Express.js:

### Implemented Features

✅ **Middleware**
- `express.urlencoded({ extended: true })` for parsing form data
- `express.json()` for parsing JSON request bodies
- Custom logger middleware that logs HTTP method and URL

✅ **Routes**
- `/` — Home page with navigation
- `/search` — Search page with query parameter `q`
- `/item/:id` — Item details page with route parameter `id`
- `/contact` — Contact form (GET) and form submission handler (POST)
- `/api/info` — JSON API endpoint returning project information

✅ **404 Handling**
- Custom 404 page using `app.use()` middleware for unknown routes

✅ **Navigation**
- Consistent navigation links across all pages

✅ **Validation**
- Server-side validation returning HTTP 400 for missing parameters:
  - `/search` — validates query parameter `q`
  - `/item/:id` — validates route parameter `id`
  - `POST /contact` — validates required form fields

✅ **Data Saving**
- Contact form submissions saved to `submissions.json` using `fs.writeFile()`

## Assignment 3 - Part 1 Features

This assignment demonstrates MongoDB integration and CRUD API implementation with advanced querying:

### Implemented Features

✅ **Database Integration**
- MongoDB database using native Node.js driver (no Mongoose)
- Collection: `habits` with fields: `_id` (ObjectId), `title`, `description`, `created_at`, `updated_at`
- Collection created automatically on first insert (MongoDB behavior)
- Database module (`db.js`) with async CRUD operations

✅ **CRUD API Endpoints**
- `GET /api/habits` — Get all habits with filtering, sorting, and projection support
- `GET /api/habits/:id` — Get single habit by ObjectId
- `POST /api/habits` — Create new habit
- `PUT /api/habits/:id` — Update existing habit
- `DELETE /api/habits/:id` — Delete habit

✅ **Advanced Query Features**
- **Filtering**: Support MongoDB filter queries via `?filter={...}` query parameter
- **Sorting**: Support MongoDB sort queries via `?sort={...}` query parameter
- **Projection**: Support MongoDB projection queries via `?projection={...}` query parameter
- All query parameters accept JSON strings and can be combined

✅ **Validation & HTTP Status Codes**
- **200 OK** — Successful GET/PUT/DELETE
- **201 Created** — Successful POST
- **400 Bad Request** — Invalid ObjectId, missing required fields, or invalid query format
- **404 Not Found** — Habit not found
- **500 Internal Server Error** — Database/server errors

✅ **Middleware**
- `express.json()` for parsing JSON request bodies
- Custom logger middleware (logs HTTP method + URL)
- `express.urlencoded()` for form data parsing

✅ **404 Handler**
- Global 404 handler for API routes (returns JSON)
- Returns HTML 404 page for regular routes

✅ **Home Page**
- Comprehensive API test links with examples for filtering, sorting, and projection
- Direct links to test GET operations
- curl examples for POST, PUT, DELETE operations

## Topic Explanation

Habits compound over time. FocusFlow shortens the feedback loop with an easy log and weekly reflections so you stay on track without feeling overwhelmed.

## Team Member Contributions

- **Nursalim Onalbayev** — [Feature/contribution description]
- **Zhalgas Torekeldi** — [Feature/contribution description]
- **Alisher Akhmet** — [Feature/contribution description]

> Each team member should update this section with their specific contributions to the assignment.
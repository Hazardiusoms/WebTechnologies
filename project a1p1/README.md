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

### Local Development

1. **Install dependencies**  
   ```bash
   npm install
   ```

2. **Set up environment variables**  
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/focusflow
   ```
   
   For local MongoDB, make sure MongoDB is running on your machine. Alternatively, you can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available) and use your connection string:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/focusflow?retryWrites=true&w=majority
   ```

3. **Run the server**  
   ```bash
   npm start
   ```

4. **Open the app**  
   Visit `http://localhost:3000`

### Environment Variables

The application requires the following environment variables:

- **`PORT`** (optional, defaults to 3000) - The port on which the server will run
- **`MONGO_URI`** (required) - MongoDB connection string

**Important:** Never commit your `.env` file to version control. The `.gitignore` file is configured to exclude it.

## Routes

### HTML Routes

- **`/`** — Home (main page with full CRUD interface)
  - Returns: HTML page (index.html) with habit management interface
  - Method: GET
  - Status: 200
  - Features: Create, Read, Update, Delete habits through web interface

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

- **`GET /api/habits`** — Get all habits
  - Returns: JSON array of all habits (sorted by id ASC)
  - Method: GET
  - Status: 200 OK
  - Example: `GET /api/habits`

- **`GET /api/habits/:id`** — Get a single habit by id
  - Returns: JSON object with habit data
  - Method: GET
  - Status: 200 OK (or 400/404 if invalid/not found)
  - Validation: Returns 400 if id is not a valid number
  - Example: `GET /api/habits/1`

- **`POST /api/habits`** — Create a new habit
  - Returns: JSON object with created habit (including id)
  - Method: POST
  - Status: 201 Created (or 400/500 if validation/error)
  - Body (JSON): `{ "title": "string", "description": "string" }`
  - Validation: Returns 400 if title or description is missing
  - Example: `POST /api/habits` with body `{"title": "Exercise", "description": "30 minutes daily"}`

- **`PUT /api/habits/:id`** — Update an existing habit by id
  - Returns: JSON object with updated habit
  - Method: PUT
  - Status: 200 OK (or 400/404/500 if invalid/not found/error)
  - Body (JSON): `{ "title": "string", "description": "string" }`
  - Validation: Returns 400 if id is invalid or fields are missing, 404 if habit not found
  - Example: `PUT /api/habits/1` with body `{"title": "Exercise", "description": "45 minutes daily"}`

- **`DELETE /api/habits/:id`** — Delete a habit by id
  - Returns: JSON object with success message
  - Method: DELETE
  - Status: 200 OK (or 400/404/500 if invalid/not found/error)
  - Validation: Returns 400 if id is invalid, 404 if habit not found
  - Example: `DELETE /api/habits/1`

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
- Connection string configured via `MONGO_URI` environment variable
- Collection: `habits` (created automatically on first insert)

### Collection Structure

**Collection: `habits`**

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique identifier for each habit (auto-incremented) |
| `title` | String | Name/title of the habit (required) |
| `description` | String | Description/details of the habit (required) |
| `created_at` | String (ISO 8601) | Timestamp when habit was created |

The collection is automatically created when the first habit is inserted.

## Project Structure

```
project-root/
├── public/
│   └── style.css
├── views/
│   ├── index.html (CRUD interface)
│   ├── about.html
│   ├── contact.html
│   ├── search.html
│   ├── item.html
│   └── 404.html
├── db.js (MongoDB database module)
├── server.js
├── package.json
├── .env (create this file, not committed to git)
├── .env.example (example environment variables)
├── .gitignore
├── submissions.json (created automatically when contact form is submitted)
└── README.md
```

## Assignment 2 - Part 1 Features

This assignment demonstrates server-side request handling in Express.js:

### Implemented Features

✅ **Middleware**
- `express.urlencoded({ extended: true })` for parsing form data
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

## Assignment 2 - Part 2 Features

This assignment demonstrates database integration and CRUD API implementation:

### Implemented Features

✅ **Database Integration**
- SQLite database with automatic table creation
- Table: `habits` with fields: `id` (PRIMARY KEY), `title`, `description`, `created_at`
- Database module (`db.js`) with CRUD operations

✅ **CRUD API Endpoints**
- `GET /api/habits` — Get all habits (sorted by id ASC)
- `GET /api/habits/:id` — Get single habit by id
- `POST /api/habits` — Create new habit
- `PUT /api/habits/:id` — Update existing habit
- `DELETE /api/habits/:id` — Delete habit

✅ **Validation & HTTP Status Codes**
- **200 OK** — Successful GET/PUT/DELETE
- **201 Created** — Successful POST
- **400 Bad Request** — Invalid id or missing required fields
- **404 Not Found** — Habit not found
- **500 Internal Server Error** — Database/server errors

✅ **Middleware**
- `express.json()` added for parsing JSON request bodies
- Custom logger middleware (kept from Part 1)
- `express.urlencoded()` (kept from Part 1)

✅ **404 Handler Enhancement**
- Returns JSON for API routes (`/api/*`)
- Returns HTML for regular pages

✅ **Home Page Updates**
- Added test links for API endpoints (`/api/habits`, `/api/habits/1`)

## Assignment 3 - Part 2 Features

This assignment demonstrates deployment, production web interface, and full CRUD functionality:

### Implemented Features

✅ **Database Migration**
- Migrated from SQLite to MongoDB
- MongoDB connection via `MONGO_URI` environment variable
- Async/await pattern for all database operations

✅ **Environment Variables**
- `PORT` - Server port (defaults to 3000)
- `MONGO_URI` - MongoDB connection string
- `.env` file for local development (excluded from git)
- Production environment variables configured via hosting platform

✅ **Production Web Interface**
- Full CRUD interface accessible at root URL (`/`)
- Create new habits via form
- View all habits in a table/catalog
- Edit existing habits through the interface
- Delete habits with confirmation
- All operations use `fetch()` API to communicate with backend
- Dynamic data loading from MongoDB
- Responsive design for mobile devices

✅ **Deployment Ready**
- Server uses `process.env.PORT` for port configuration
- MongoDB connection works in production
- Application starts without errors
- Public URL accessible (when deployed)

✅ **GitHub Repository**
- `.gitignore` file excludes sensitive files (`.env`, `node_modules`, etc.)
- Meaningful commit history
- Complete README with setup and deployment instructions

### Deployment Instructions

#### Option 1: Deploy to Render (Recommended)

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service:**
   - Connect your GitHub repository
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: `Node`

3. **Set Environment Variables:**
   - `PORT` - Will be automatically set by Render
   - `MONGO_URI` - Your MongoDB connection string (from MongoDB Atlas or local)

4. **Deploy** - Render will automatically deploy your application

#### Option 2: Deploy to Heroku

1. **Install Heroku CLI** and login

2. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set MONGO_URI=your_mongodb_connection_string
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

#### Option 3: Deploy to Railway

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Create a new project** and connect your GitHub repository

3. **Add MongoDB service** (or use external MongoDB Atlas)

4. **Set environment variables** in the Railway dashboard

5. **Deploy** - Railway will automatically deploy your application

#### MongoDB Setup (MongoDB Atlas - Free Tier)

1. **Create a MongoDB Atlas account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a new cluster** (free tier M0)

3. **Create a database user:**
   - Database Access → Add New Database User
   - Remember your username and password

4. **Whitelist IP addresses:**
   - Network Access → Add IP Address
   - For production, add `0.0.0.0/0` to allow all IPs (or your hosting platform's IP)

5. **Get connection string:**
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `focusflow` (or your preferred database name)

6. **Use the connection string** as your `MONGO_URI` environment variable

### Production Checklist

- [x] Application deployed to public URL
- [x] Server uses `process.env.PORT`
- [x] MongoDB connection configured via `MONGO_URI`
- [x] `.env` file not committed to git
- [x] Full CRUD interface accessible at root URL (`/`)
- [x] All CRUD operations work through web interface
- [x] Data loaded dynamically from backend API
- [x] Application starts without errors
- [x] README includes deployment instructions

## Topic Explanation

Habits compound over time. FocusFlow shortens the feedback loop with an easy log and weekly reflections so you stay on track without feeling overwhelmed.

## Team Member Contributions

- **Nursalim Onalbayev** — [Feature/contribution description]
- **Zhalgas Torekeldi** — [Feature/contribution description]
- **Alisher Akhmet** — [Feature/contribution description]

> Each team member should update this section with their specific contributions to the assignment.
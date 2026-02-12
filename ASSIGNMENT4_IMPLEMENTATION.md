# Assignment 4 - Implementation Summary

## Overview
This document summarizes the implementation of Assignment 4 features: Sessions & Security for the FocusFlow habit tracker application.

## ✅ Completed Features

### 1. **Expanded Habit Entity (5-8 Fields)**
The habit entity now includes the following fields:
- `id` - Unique identifier
- `title` - Habit title (required)
- `description` - Habit description (required)
- `category` - Category (Health, Fitness, Learning, Productivity, Social, Mindfulness, General)
- `frequency` - Frequency (Daily, Weekly, Bi-weekly, Monthly)
- `priority` - Priority level (Low, Medium, High)
- `status` - Status (Active, Paused, Completed)
- `target_date` - Optional target completion date
- `streak` - Current streak in days
- `notes` - Additional notes
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### 2. **Sessions-Based Authentication**
- ✅ Express-session middleware configured
- ✅ Session stored in secure cookies
- ✅ HttpOnly flag enabled (required)
- ✅ Secure flag enabled in production (recommended)
- ✅ Session persists between requests
- ✅ Session ID stored in cookie named `sessionId`

### 3. **User Management**
- ✅ User registration via `/api/register` endpoint
- ✅ User login via `/api/login` endpoint
- ✅ User logout via `/api/logout` endpoint
- ✅ Password hashing using bcrypt (10 salt rounds)
- ✅ Generic error messages for security ("Invalid credentials")
- ✅ User collection in MongoDB with indexes

### 4. **Authentication Middleware**
- ✅ `requireAuth` middleware protects write operations
- ✅ POST `/api/habits` - Protected (Create)
- ✅ PUT `/api/habits/:id` - Protected (Update)
- ✅ DELETE `/api/habits/:id` - Protected (Delete)
- ✅ GET `/api/habits` - Public (Read)
- ✅ GET `/api/habits/:id` - Public (Read)

### 5. **Web Interface Updates**
- ✅ Login page at `/login`
- ✅ Registration page at `/register`
- ✅ Authentication status displayed in navigation
- ✅ Login/Logout buttons in header
- ✅ Form disabled for unauthenticated users
- ✅ Edit/Delete buttons disabled for unauthenticated users
- ✅ Expanded habit form with all new fields
- ✅ Updated habits table showing all fields
- ✅ Visual badges for priority and status

### 6. **Cookie Security**
- ✅ HttpOnly flag - Prevents JavaScript access
- ✅ Secure flag - Enabled in production (HTTPS only)
- ✅ SameSite: 'strict' - CSRF protection
- ✅ MaxAge: 24 hours
- ✅ No sensitive data stored in cookies

### 7. **Password Security**
- ✅ bcrypt hashing with 10 salt rounds
- ✅ No plain-text password storage
- ✅ Generic error messages ("Invalid credentials")
- ✅ Password validation (minimum 6 characters)

### 8. **Validation & Error Handling**
- ✅ Input validation for all fields
- ✅ Proper HTTP status codes:
  - 200 OK - Successful GET/PUT/DELETE
  - 201 Created - Successful POST
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Authentication required
  - 404 Not Found - Resource not found
  - 500 Internal Server Error - Server errors
- ✅ Application stability - No crashes on invalid requests
- ✅ Error messages displayed to users

### 9. **Database Seeding**
- ✅ Seed script (`seed.js`) created
- ✅ 25 realistic habit records
- ✅ Test user created (username: `testuser`, password: `password123`)
- ✅ Run with: `npm run seed`

## 📁 Files Modified/Created

### Modified Files:
1. **server.js** - Added sessions, authentication, protected routes
2. **db.js** - Expanded habit operations, added user management
3. **views/index.html** - Updated UI with auth, expanded form
4. **public/style.css** - Added badge styles, form input styles
5. **package.json** - Added dependencies and seed script

### New Files:
1. **views/login.html** - Login page
2. **views/register.html** - Registration page
3. **seed.js** - Database seeding script

## 🔐 Security Features Explained

### Sessions
- Sessions store user authentication state on the server
- Session ID is stored in a cookie and sent with each request
- Server validates session ID to determine if user is authenticated

### Cookies
- **HttpOnly**: Prevents JavaScript from accessing the cookie (protects against XSS)
- **Secure**: Only sent over HTTPS in production (protects against man-in-the-middle)
- **SameSite: strict**: Prevents CSRF attacks by not sending cookies on cross-site requests

### Authentication vs Authorization
- **Authentication**: Verifying who the user is (login process)
- **Authorization**: Determining what the user can do (write operations require auth)

## 🚀 How to Use

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed the Database
```bash
npm run seed
```
This will:
- Create 25 sample habits
- Create a test user (username: `testuser`, password: `password123`)

### 3. Start the Server
```bash
npm start
```

### 4. Access the Application
- Home: `http://localhost:3000/`
- Login: `http://localhost:3000/login`
- Register: `http://localhost:3000/register`

### 5. Test Authentication
1. Visit the home page - you'll see habits but can't create/edit/delete
2. Click "Login" and use:
   - Username: `testuser`
   - Password: `password123`
3. After login, you can create, edit, and delete habits
4. Click "Logout" to end your session

## 📊 Database Structure

### Habits Collection
- 25+ records with realistic data
- All fields populated
- Various categories, frequencies, priorities, and statuses

### Users Collection
- Username (unique, indexed)
- Email (unique, indexed)
- Password (hashed with bcrypt)
- Created timestamp

## 🎯 Defense Checklist

During defense, you should be able to:
- ✅ Open the deployed public URL
- ✅ Demonstrate full CRUD functionality via Web UI
- ✅ Show unauthorized users cannot create/update/delete
- ✅ Demonstrate login and authorized actions
- ✅ Explain how sessions work
- ✅ Explain how cookies are used
- ✅ Explain HttpOnly and Secure flags
- ✅ Explain authentication vs authorization

## 🔍 Key Implementation Details

### Session Configuration
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || 'focusflow-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'strict'
  }
}));
```

### Authentication Middleware
```javascript
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}
```

### Password Hashing
```javascript
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

## 📝 Notes

- The application maintains backward compatibility with existing habits
- All write operations are protected by authentication
- Read operations remain public for better UX
- Generic error messages protect against user enumeration attacks
- Session secret should be changed in production via environment variable

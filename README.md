===============================================================================
                    FITNESS TRACKER - PROJECT DOCUMENTATION
===============================================================================

PROJECT OVERVIEW
================
Full-stack web application for tracking workouts, monitoring progress, and 
managing fitness goals with user authentication and external API integration.

Author: Code Busters
Repository: https://github.com/FlavioCervantes/Fitness-Tracker


CORE DEPENDENCIES & TECH STACK
===============================

Backend:
--------
- Express.js - Web server framework
- MySQL2 - Database connection (AWS RDS)
- EJS - Server-side templating
- Express-session - User authentication/session management
- Bcrypt - Password hashing
- Node-fetch - External API calls
- Dotenv - Environment variables

Frontend:
---------
- Bootstrap 5 - UI framework
- Custom CSS - Styling with CSS variables
- Vanilla JavaScript - Client-side interactions


FILE STRUCTURE & DEPENDENCIES
==============================

1. index.mjs (Backend Core - 734 lines)
   Purpose: Main server file handling all routes and business logic
   
   Key Functions:
   - motivationalQuote() - Fetches quotes from ZenQuotes API
   - isAuthenticated() - Middleware to protect routes
   - Database queries via MySQL2 connection pool
   
   Routes:
   Public:
   - GET  /              - Homepage
   - GET  /register      - Registration form
   - POST /register      - Register new user
   - GET  /login         - Login form
   - POST /login         - Authenticate user
   
   Protected (requires authentication):
   - GET  /dashboard     - User dashboard
   - GET  /profile       - User profile
   - POST /profile/update - Update profile
   - GET  /exercises     - Exercise library
   - GET  /progress      - Progress tracking
   - POST /progress/add  - Add measurements
   - GET  /workout/log   - Workout form
   - POST /workout/log   - Save workout
   - GET  /workout/:id   - View workout details
   - GET  /workout/edit/:id - Edit workout form
   - POST /workout/edit/:id - Update workout
   - POST /workout/delete/:id - Delete workout
   
   APIs:
   - GET /api/quote      - Random motivational quote
   - GET /api/stats      - User workout statistics
   - GET /api/exercises/search - Search exercises
   
   Dependencies:
   - MySQL database tables: userInfo, workouts, exercises, userProgress, workoutGroups
   - .env file: API_NINJAS_KEY, SESSION_SECRET
   - All EJS views in /views directory


2. PUBLIC ASSETS

   styles.css (319 lines)
   Purpose: Custom styling with modern design system
   
   CSS Variables (Root):
   --color-primary: #4CAF50     (Green - primary actions)
   --color-accent: #FF9800      (Orange - highlights)
   --color-secondary: #2196F3   (Blue - secondary actions)
   --color-bg: #F5F7FA          (Light background)
   --color-surface: #FFFFFF     (Card backgrounds)
   --text-primary: #212121      (Main text)
   --text-secondary: #616161    (Secondary text)
   
   Key Styles:
   - Cards: 4px border-radius, 1.5rem padding, subtle shadows
   - Navbar: Green background, white text, 1.5rem horizontal padding
   - Buttons: Primary (green), Secondary (blue), Success (blue)
   - Form Controls: 4px border-radius, focus states with primary color
   - Exercise Cards: Image hover zoom (4x scale), centered layout
   
   
   script.js (121 lines)
   Purpose: Client-side JavaScript for dynamic interactions
   
   Functions:
   1. init() - Initializes all handlers on page load
   2. loadMotivationQuote() - Fetches quote from /api/quote
   3. handleWorkoutForm() - Submits workout data, redirects to dashboard
   4. handleProfileForm() - Updates user profile via /profile/update
   5. handleProgressForm() - Submits body measurements via /progress/add
   
   Dependencies:
   - Backend API endpoints
   - HTML elements with specific IDs


UI PAGES DETAILED BREAKDOWN
============================

1. Homepage (index.ejs)
   Visual Elements:
   - Clean landing page with centered content
   - Daily inspiration quote in card format
   - Two prominent CTAs: "Get Started" (primary) & "Login" (secondary)
   - Navbar with Login/Sign Up links
   
   User Flow: First impression → Register or Login


2. Registration Page (register.ejs)
   Form Elements (Required):
   - Name (text input)
   - Email (email input)
   - Password (password input, min 6 characters)
   - Confirm Password (password input)
   
   Form Elements (Optional):
   - Height in cm (number input)
   - Weight in kg (number input)
   - Fitness Goals (textarea)
   
   Validation:
   - Client-side: HTML5 required fields, password min length (6)
   - Server-side: Email uniqueness, password matching
   
   User Flow: Complete form → Auto-login → Redirect to Dashboard


3. Login Page (logIn.ejs)
   Form Elements:
   - Email (email input)
   - Password (password input)
   - Error alerts for invalid credentials
   - Link to registration page
   
   User Flow: Enter credentials → Create session → Redirect to Dashboard


4. Dashboard (dashboard.ejs) - MAIN HUB
   Navigation Bar:
   - "Dashboard" brand link
   - Links: Exercises, Progress, Logout
   
   Card Layout (4 main sections):
   
   A. Daily Inspiration Card
      - Quote content (dynamically loaded from ZenQuotes API)
      - Author attribution with em dash
      - Refreshes with page reload
   
   B. Log Your Workout Card
      - Date picker (defaults to today)
      - Duration input (minutes)
      - Dynamic exercise list
      - Form submits to /workout/log
      - Redirects to dashboard on success
   
   C. Update Profile Card
      - Email input (editable)
      - Height input (inches)
      - Weight input (lbs, min 1, max 1500)
      - Pre-filled with existing user data
      - Updates via /profile/update
   
   D. Recent Workouts Card
      - Table showing last 5 workouts
      - Columns: Date, Duration, Exercises, Total Volume
      - Edit/Delete buttons for each workout
      - "View All" link to workout history
   
   User Flow: Dashboard is central hub → All features accessible


5. Exercises Page (exercises.ejs)
   Layout:
   - Search bar for filtering exercises
   - Muscle group filter buttons
   - Grid of exercise cards (Bootstrap columns)
   
   Exercise Cards:
   - Muscle group image with hover effect
   - Exercise name (centered)
   - Muscle group badge
   - Equipment information
   
   Images Location: /public/img/muscle-groups/
   Available Images:
   - back.jpg
   - biceps.jpg
   - cardio.jpg
   - chest.jpg
   - core.jpg
   - legs.jpg
   - shoulders.jpg
   - triceps.jpg
   
   Hover Effect:
   - Transform: scale(4.0)
   - Transform-origin: center center
   - Transition: 0.3s ease
   - Box-shadow: 0 12px 24px rgba(0,0,0,0.3)
   - Z-index: 10
   
   User Flow: Browse exercises → Search/Filter → View details


6. Profile Page (profile.ejs)
   Layout (2 columns):
   
   Left Column - Edit Profile Card:
   - Name (read-only, contact support to change)
   - Email (editable)
   - Height in cm (number input)
   - Weight in kg (number input)
   - Fitness Goals (textarea, 4 rows)
   - Info alert with tip
   - "Save Changes" button
   
   Right Column - Account Information:
   - Account Status badge (green "Active")
   - Member Since date (formatted)
   
   User Flow: Update any field → Click Save → Success feedback


7. Progress Page (progress.ejs)
   Add New Measurement Card:
   - 6 body measurement inputs (all in cm):
     * Chest
     * Arm
     * Shoulder
     * Leg
     * Hip
   - Recorded Date
   - "Add Measurement" button
   
   Progress History:
   - Table showing all measurements chronologically
   - Date column
   - All measurement columns
   - Allows tracking changes over time
   
   User Flow: Enter measurements → Submit → View history → Track progress


8. Edit Workout Page (editWorkout.ejs)
   Layout:
   - Pre-filled workout form
   - Date (editable)
   - Duration (editable)
   - List of current exercises with:
     * Exercise name
     * Sets
     * Reps
     * Weight
     * Muscle group
   - Exercise library sidebar for adding exercises
   - "Update Workout" button (saves changes)
   - "Delete Workout" button (removes workout)
   
   User Flow: 
   - From Dashboard recent workouts → Click Edit
   - Modify details → Update
   - Or Delete → Confirm → Return to Dashboard


DATA FLOW & DEPENDENCIES
=========================

Session Flow:
-------------
User Registers/Logs In
    →
Express-Session creates session with secret key
    →
Session data stored: { userId, userName, userEmail }
    →
isAuthenticated() middleware checks req.session.userId
    →
If authenticated: proceed to route
If not: redirect to /login


Workout Logging Flow:
---------------------
Dashboard → User fills Log Workout form
    →
User clicks "Save Workout"
    →
script.js captures form data (date, duration, exercises)
   →
POST request to /workout/log with JSON body
   →
index.mjs receives request
    →
INSERT into workouts table (userId, date, duration)
    →
For each exercise: INSERT into workoutGroups table
    →
Return JSON: { success: true, workoutId: X }
    →
script.js receives response
   →
Alert "Workout logged successfully!"
   →
window.location.href = "/dashboard"
   →
Dashboard loads with updated workout list


Quote API Flow:
---------------
Page loads (homepage or dashboard)
    →
Server calls motivationalQuote() function
    →
Fetch from https://zenquotes.io/api/random
    →
API returns JSON array: [{ q: "quote text", a: "author name" }]
    →
Extract first element: data[0]
    →
Return object: { content: quote.q, author: quote.a }
    →
Pass to EJS template
   →
Template renders: <%= quote.content %> and <%= quote.author %>
    →
(Optional) Client can also fetch via /api/quote endpoint


Profile Update Flow:
--------------------
Profile page loads with existing user data
    →
User modifies email, height, weight, or goals
    →
Clicks "Save Changes"
    →
script.js preventDefault()
    →
Collects form data
    →
POST to /profile/update with JSON body
   →
index.mjs UPDATE userInfo SET email=?, height=?, weight=?, goals=?
    →
Update session email if changed
    →
Return JSON: { success: true }
  →
Alert "Profile updated!"


DATABASE SCHEMA
===============

Tables Used:
1. userInfo
   - userId (PRIMARY KEY, AUTO_INCREMENT)
   - name
   - email (UNIQUE)
   - password (hashed with bcrypt)
   - height
   - weight
   - goals
   - createdAt
   - accountStatus

2. workouts
   - workoutId (PRIMARY KEY, AUTO_INCREMENT)
   - userId (FOREIGN KEY)
   - date
   - duration

3. workoutGroups
   - groupId (PRIMARY KEY, AUTO_INCREMENT)
   - workoutId (FOREIGN KEY)
   - muscleGroup
   - exerciseId (FOREIGN KEY)
   - sets
   - reps
   - weight

4. exercises
   - exerciseId (PRIMARY KEY, AUTO_INCREMENT)
   - nameOfExercise
   - muscleGroup
   - equipment
   - instructions
   - imageURL
   - apiSource

5. userProgress
   - progressId (PRIMARY KEY, AUTO_INCREMENT)
   - userId (FOREIGN KEY)
   - chestDiameter
   - armDiameter
   - shoulderDiameter
   - legDiameter
   - hipDiameter
   - recordedDate


DESIGN SYSTEM 
===============================

Color Palette:
- Primary Green (#4CAF50) - Main actions, navbar, success states
- Accent Orange (#FF9800) - Highlights, hover states, call-to-action
- Secondary Blue (#2196F3) - Alternative actions, links
- Background (#F5F7FA) - Page background, subtle contrast
- Surface White (#FFFFFF) - Cards, modals, overlays
- Text Primary (#212121) - Main headings, body text
- Text Secondary (#616161) - Captions, metadata, placeholders

Typography:
- Font Family: 'monospace', 'Times New Roman', Times, serif
- Navbar Brand: 1.5rem, bold
- Headings: Color primary, bold, 20px margin-bottom
- Card Titles: Centered or left-aligned depending on context

Spacing:
- Card Padding: 1.5rem (24px)
- Navbar Padding: 15px vertical, 1.5rem horizontal
- Margin Bottom: 20-30px between sections
- Form Controls: 12px padding

Border Radius:
- Modern Squared: 4px (cards, buttons, inputs, navbar)
- Rounded Buttons: 25px for primary CTAs
- Badges: 20px

Shadows:
- Cards: 0 5px 15px rgba(0, 0, 0, 0.1)
- Card Hover: 0 10px 25px rgba(0, 0, 0, 0.2)
- Button Hover: 0 5px 15px with color-specific rgba

Animations:
- Button Hover: translateY(-2px) in 0.3s
- Card Hover: translateY(-5px) in 0.2s
- Exercise Image Hover: scale(4.0) in 0.3s
- Navbar Link Hover: scale(1.05) + text-shadow

DEPLOYMENT NOTES
================

Prerequisites:
1. Node.js installed
2. MySQL database accessible
3. Environment variables configured

Environment Variables (.env):
API_NINJAS_KEY=<not currently used, kept for future>
SESSION_SECRET=<your-secret-key>

Database Connection (in index.mjs):
host: "y5s2h87f6ur56vae.cbetxkdyhwsb.us-east-1.rds.amazonaws.com"
user: "x961annv2rwlrope"
password: "*************"
database: "c5dhod81zi9fvecy"

To Run:
npm install
npm start
// Or for development with auto-restart:
npm run dev

Server runs on: http://localhost:3000


PROJECT STATUS
==============

Current Branch: main
Status: Production Ready
All Requirements: Met
Code Quality: Clean, documented, no unused files
Database: Connected to AWS RDS MySQL
External API: ZenQuotes integrated and working
Authentication: Session-based, secure
Testing Status: All features tested and operational

Last Updated: December 14, 2025

===============================================================================
                              END OF DOCUMENTATION
===============================================================================

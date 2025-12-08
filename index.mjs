import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';
import session from 'express-session';

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'fitness-tracker-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "y5s2h87f6ur56vae.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "x961annv2rwlrope",
    password: "yziygibqpk3q352o",
    database: "c5dhod81zi9fvecy",
    connectionLimit: 10,
    waitForConnections: true
});


// Test database connection
app.get("/dbTest", async (req, res) => {
    try {
        let sql = "SELECT CURDATE()";
        const [rows] = await pool.query(sql);
        res.send(rows);
    } 
    catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// fetch motivational quote from API
async function motivationalQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random?tags=inspirational');
        const data = await response.json();
        return { content: data.content, author: data.author };
    } 
    catch (error) {
        return { 
            content: "The only bad workout is the one that didn't happen.", 
            author: "Unknown" 
        };
    }
}

// Homepage
app.get("/", async (req, res) => {
    const quote = await motivationalQuote();
    res.render("index", { 
        user: req.session.userId ? req.session : null, 
        quote 
    });
});

// Registration Page
app.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// Registration Form Submission
app.post("/register", async (req, res) => {
    const { name, email, password, confirmPassword, height, weight, goals } = req.body;
    
    try {
        // Validation
        if (!name || !email || !password) {
            return res.render("register", { error: "All fields required" });
        }
        
        if (password !== confirmPassword) {
            return res.render("register", { error: "Passwords don't match" });
        }
        
        // Check if email exists
        let sql = `
            SELECT userId 
            FROM userInfo 
            WHERE email = ?`;
        const [existing] = await pool.query(sql, [email]);
        
        if (existing.length > 0) {
            return res.render("register", { error: "Email already registered" });
        }
        
        // Hash password and insert user
        const hashedPassword = await bcrypt.hash(password, 10);
        
        sql = `
            INSERT INTO userInfo (name, email, password, height, weight, goals) 
            VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await pool.query(sql, [
            name, 
            email, 
            hashedPassword, 
            height || null, 
            weight || null, 
            goals || null
        ]);
        
        // Create session
        req.session.userId = result.insertId;
        req.session.userName = name;
        req.session.userEmail = email;
        
        res.redirect("/dashboard");
    } 
    catch (error) {
        console.error("Registration error:", error);
        res.render("register", { error: "Registration failed" });
    }
});

// route for login page
app.get("/login", (req, res) => {
    res.render("logIn", { error: null });
});

// route to login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        let sql = `
            SELECT * 
            FROM userInfo 
            WHERE email = ?`;
        const [users] = await pool.query(sql, [email]);
        
        if (users.length === 0) {
            return res.render("logIn", { error: "Invalid credentials" });
        }
        
        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return res.render("logIn", { error: "Invalid credentials" });
        }
        
        // Check account status
        if (user.accountStatus === 'disabled') {
            return res.render("logIn", { error: "Account has been disabled" });
        }
        
        // Create session
        req.session.userId = user.userId;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        req.session.isAdmin = user.isAdmin;
        
        // Update last login
        sql = `
            UPDATE userInfo 
            SET lastLogin = NOW() 
            WHERE userId = ?`;
        await pool.query(sql, [user.userId]);
        
        res.redirect("/dashboard");
    } 
    catch (error) {
        console.error("Login error:", error);
        res.render("logIn", { error: "Login failed" });
    }
});

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
});

// User Dashboard
app.get("/dashboard", isAuthenticated, async (req, res) => {
    try {
        // Get user info
        let sql = `
            SELECT * 
            FROM userInfo 
            WHERE userId = ?`;
        const [userInfo] = await pool.query(sql, [req.session.userId]);
        
        // Get recent workouts with exercise count and total volume
        sql = `
            SELECT w.*, 
                   COUNT(DISTINCT wg.exerciseId) as exerciseCount,
                   SUM(wg.sets * wg.reps * wg.weight) as totalVolume
            FROM workouts w
            LEFT JOIN workoutGroups wg ON w.workoutId = wg.workoutId
            WHERE w.userId = ?
            GROUP BY w.workoutId
            ORDER BY w.date DESC
            LIMIT 5`;
        const [workouts] = await pool.query(sql, [req.session.userId]);
        
        // Get workout statistics
        sql = `
            SELECT 
                COUNT(DISTINCT workoutId) as totalWorkouts,
                SUM(duration) as totalMinutes,
                COUNT(DISTINCT DATE_FORMAT(date, '%Y-%m')) as monthsActive
            FROM workouts 
            WHERE userId = ?`;
        const [stats] = await pool.query(sql, [req.session.userId]);
        
        // Get motivational quote
        const quote = await motivationalQuote();
        
        res.render("dashboard", {
            user: userInfo[0],
            workouts: workouts,
            stats: stats[0],
            quote: quote
        });
    } 
    catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).send("Error loading dashboard");
    }
});

// route to workout page
app.get("/workout/log", isAuthenticated, async (req, res) => {
    try {
        let sql = `
            SELECT * 
            FROM exercises 
            ORDER BY muscleGroup, nameOfExercise`;
        const [exercises] = await pool.query(sql);
        
        res.render("log-workout", { 
            user: req.session, 
            exercises: exercises 
        });
    } 
    catch (error) {
        console.error("Log workout error:", error);
        res.status(500).send("Error loading workout form");
    }
});

// Submit Workout
app.post("/workout/log", isAuthenticated, async (req, res) => {
    const { date, duration, exercises } = req.body;
    
    try {
        // Insert workout
        let sql = `
            INSERT INTO workouts (userId, date, duration) 
            VALUES (?, ?, ?)`;
        const [result] = await pool.query(sql, [
            req.session.userId, 
            date, 
            duration
        ]);
        
        const workoutId = result.insertId;
        
        // Insert exercise groups
        if (exercises && Array.isArray(exercises)) {
            sql = `
                INSERT INTO workoutGroups 
                (workoutId, muscleGroup, exerciseId, sets, reps, weight) 
                VALUES (?, ?, ?, ?, ?, ?)`;
            
            for (const ex of exercises) {
                await pool.query(sql, [
                    workoutId,
                    ex.muscleGroup,
                    ex.exerciseId,
                    ex.sets,
                    ex.reps,
                    ex.weight
                ]);
            }
        }
        
        res.json({ success: true, workoutId: workoutId });
    } 
    catch (error) {
        console.error("Log workout error:", error);
        res.status(500).json({ success: false });
    }
});

// route to get workout history
app.get("/workout/history", isAuthenticated, async (req, res) => {
    try {
        let sql = `
            SELECT w.*, 
                   GROUP_CONCAT(DISTINCT e.nameOfExercise SEPARATOR ', ') as exercises,
                   SUM(wg.sets * wg.reps * wg.weight) as totalVolume
            FROM workouts w
            LEFT JOIN workoutGroups wg ON w.workoutId = wg.workoutId
            LEFT JOIN exercises e ON wg.exerciseId = e.exerciseId
            WHERE w.userId = ?
            GROUP BY w.workoutId
            ORDER BY w.date DESC`;
        const [workouts] = await pool.query(sql, [req.session.userId]);
        
        res.render("workout-history", { 
            user: req.session, 
            workouts: workouts 
        });
    } 
    catch (error) {
        console.error("Workout history error:", error);
        res.status(500).send("Error loading workout history");
    }
});

// route to get workout details
app.get("/workout/:id", isAuthenticated, async (req, res) => {
    try {
        // fo workout details
        let sql = `
            SELECT * 
            FROM workouts 
            WHERE workoutId = ? AND userId = ?`;
        const [workout] = await pool.query(sql, [
            req.params.id, 
            req.session.userId
        ]);
        
        if (workout.length === 0) {
            return res.status(404).send("Workout not found");
        }
        
        // for exercises in this workout
        sql = `
            SELECT wg.*, e.nameOfExercise, e.imageURL, e.muscleGroup
            FROM workoutGroups wg
            JOIN exercises e ON wg.exerciseId = e.exerciseId
            WHERE wg.workoutId = ?
            ORDER BY wg.groupId`;
        const [exerciseGroups] = await pool.query(sql, [req.params.id]);
        
        res.render("workout-detail", {
            user: req.session,
            workout: workout[0],
            exerciseGroups: exerciseGroups
        });
    } 
    catch (error) {
        console.error("Workout detail error:", error);
        res.status(500).send("Error loading workout details");
    }
});

// route to track progress
app.get("/progress", isAuthenticated, async (req, res) => {
    try {
        let sql = `
            SELECT * 
            FROM userProgress 
            WHERE userId = ? 
            ORDER BY recordedDate DESC`;
        const [progressData] = await pool.query(sql, [req.session.userId]);
        
        res.render("progress", { 
            user: req.session, 
            progressData: progressData 
        });
    } catch (error) {
        console.error("Progress error:", error);
        res.status(500).send("Error loading progress data");
    }
});

// route to post progress on body
app.post("/progress/add", isAuthenticated, async (req, res) => {
    const { chestDiameter, armDiameter, shoulderDiameter, legDiameter, hipDiameter, recordedDate } = req.body;
    
    try {
        let sql = `
            INSERT INTO userProgress 
            (userId, chestDiameter, armDiameter, shoulderDiameter, legDiameter, hipDiameter, recordedDate)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await pool.query(sql, [
            req.session.userId,
            chestDiameter,
            armDiameter,
            shoulderDiameter,
            legDiameter,
            hipDiameter,
            recordedDate
        ]);
        
        res.json({ success: true });
    } catch (error) {
        console.error("Add progress error:", error);
        res.status(500).json({ success: false });
    }
});

// route to retrieve exercise library
app.get("/exercises", isAuthenticated, async (req, res) => {
    try {
        let sql = `
            SELECT * 
            FROM exercises 
            ORDER BY muscleGroup, nameOfExercise`;
        const [exercises] = await pool.query(sql);
        
        sql = `
            SELECT DISTINCT muscleGroup 
            FROM exercises 
            ORDER BY muscleGroup`;
        const [muscleGroups] = await pool.query(sql);
        
        res.render("exercises", { 
            user: req.session, 
            exercises: exercises, 
            muscleGroups: muscleGroups 
        });
    } 
    catch (error) {
        console.error("Exercise library error:", error);
        res.status(500).send("Error loading exercises");
    }
});

// route to retrieve profile if authenticated
app.get("/profile", isAuthenticated, async (req, res) => {
    try {
        let sql = `
            SELECT * 
            FROM userInfo 
            WHERE userId = ?`;
        const [userInfo] = await pool.query(sql, [req.session.userId]);
        
        res.render("profile", { 
            user: req.session, 
            userInfo: userInfo[0] 
        });
    } 
    catch (error) {
        console.error("Profile error:", error);
        res.status(500).send("Error loading profile");
    }
});

// route to update profile
app.post("/profile/update", isAuthenticated, async (req, res) => {
    const { email, height, weight, goals } = req.body;
    
    try {
        let sql = `
            UPDATE userInfo 
            SET email = ?, height = ?, weight = ?, goals = ? 
            WHERE userId = ?`;
        await pool.query(sql, [
            email, 
            height, 
            weight, 
            goals, 
            req.session.userId
        ]);
        
        req.session.userEmail = email;
        
        res.json({ success: true });
    } 
    catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ success: false });
    }
});

// Get motivational quote
app.get("/api/quote", async (req, res) => {
    const quote = await motivationalQuote();
    res.json(quote);
});

// Get workout statistics
app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
        let sql = `
            SELECT COUNT(DISTINCT workoutId) as totalWorkouts,
                SUM(duration) as totalMinutes,
                DATEDIFF(MAX(date), MIN(date)) as daysActive
            FROM workouts
            WHERE userId = ?`;
        const [stats] = await pool.query(sql, [req.session.userId]);
        
        res.json(stats[0]);
    } 
    catch (error) {
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
});

// search exercises
app.get("/api/exercises/search", isAuthenticated, async (req, res) => {
    try {
        const { query } = req.query;
        
        let sql = `
            SELECT * 
            FROM exercises 
            WHERE nameOfExercise LIKE ? OR muscleGroup LIKE ?
            ORDER BY nameOfExercise
            LIMIT 20`;
        const [exercises] = await pool.query(sql, [`%${query}%`, `%${query}%`]);
        
        res.json(exercises);
    } 
    catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
});


app.use((req, res) => {
    res.status(404).send("Page not found");
});

app.listen(PORT, () => {
    console.log(`\n FitLog Fitness Tracker running on http://localhost:${PORT}`);
    console.log(`Database: ${process.env.DB_NAME || 'fitness_tracker'}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
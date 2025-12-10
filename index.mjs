
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

app.use(express.json());

// Configure session middleware for user authentication
app.use(session({
    secret: process.env.SESSION_SECRET || 'fitness-tracker-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, 
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// connect to DB
const pool = mysql.createPool({
    host: "y5s2h87f6ur56vae.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "x961annv2rwlrope",
    password: "yziygibqpk3q352o",
    database: "c5dhod81zi9fvecy",
    connectionLimit: 10,
    waitForConnections: true
});

// verify authentication
function isAuthenticated(req, res, next) {
    // ceck if session exists and has userId
    if (req.session && req.session.userId) {
        return next(); // User is authenticated, proceed to route
    }
    // redirect to login page
    res.redirect('/login');
}

async function motivationalQuote() {
    try {
        // API for quotes
        const response = await fetch('https://api.quotable.io/random?tags=inspirational');
        const data = await response.json();
        
        return { 
            content: data.content, 
            author: data.author 
        };
    }
    catch (error) {
        // default quote if unable to get from API
        console.error("Quote API error:", error);
        return {
            content: "The only bad workout is the one that didn't happen.",
            author: "Unknown"
        };
    }
}

// route to test connection to DB
app.get("/dbTest", async (req, res) => {
    try {
        let sql = "SELECT CURDATE() as currentDate";
        const [rows] = await pool.query(sql);
        
        res.send(rows);
    } 
		catch (error) {
        console.error("Database test error:", error);
        res.status(500).send("Database connection failed");
    }
});

// route to home page
app.get("/", async (req, res) => {
    try {
        // fetch motivational quote from API
        const quote = await motivationalQuote();
        
        res.render("index", {
            user: req.session.userId ? req.session : null,
            quote
        });
    } 
		catch (error) {
        console.error("Homepage error:", error);
        res.status(500).send("Error loading homepage");
    }
});

// route for user to go to registration form 
app.get("/register", (req, res) => {
    res.render("register", { error: null });
});

// route to post info from registration form 
app.post("/register", async (req, res) => {
    const { name, email, password, confirmPassword, height, weight, goals } = req.body;

    try {
        // ensure all fields required is filled
        if (!name || !email || !password) {
            return res.render("register", { error: "All required fields must be filled" });
        }

        // ensure passwords match
        if (password !== confirmPassword) {
            return res.render("register", { error: "Passwords don't match" });
        }

        // check if user's email already exists
        let sql = `
            SELECT userId 
            FROM userInfo 
            WHERE email = ?`;
        const [existing] = await pool.query(sql, [email]);

        if (existing.length > 0) {
            return res.render("register", { error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database
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

        // new session for newly registered user
        req.session.userId = result.insertId;
        req.session.userName = name;
        req.session.userEmail = email;

        // direct to dashboard
        res.redirect("/dashboard");
    }
    catch (error) {
        console.error("Registration error:", error);
        res.render("register", { error: "Registration failed. Please try again." });
    }
});

// route to login
app.get("/login", (req, res) => {
    res.render("logIn", { error: null });
});

// route to verify login info
app.post("/login", async (req, res) => {
    // get login credentials
    const { email, password } = req.body;

    try {
        // search DB for entered email
        let sql = `
            SELECT userId, name, email, password 
            FROM userInfo 
            WHERE email = ?`;
        const [users] = await pool.query(sql, [email]);

        // Check if user exists
        if (users.length === 0) {
            return res.render("logIn", { error: "Invalid credentials" });
        }

        const user = users[0];

        // check if passwords match
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

        // go to dashboard after loggin in
        res.redirect("/dashboard");
    }
    catch (error) {
        console.error("Login error:", error);
        res.render("logIn", { error: "Login failed" });
    }
});

// route for user to logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// route to user's dashboard
app.get("/dashboard", isAuthenticated, async (req, res) => {
    try {
        // to get user info
        let sql = `
            SELECT userId, name, email, height, weight, goals, createdAt 
            FROM userInfo 
            WHERE userId = ?`;
        const [userInfo] = await pool.query(sql, [req.session.userId]);

        // to get recent workout stats
        sql = `
            SELECT w.workoutId, w.date, w.duration,
                   COUNT(DISTINCT wg.exerciseId) as exerciseCount,
                   SUM(wg.sets * wg.reps * wg.weight) as totalVolume
            FROM workouts w
            LEFT JOIN workoutGroups wg ON w.workoutId = wg.workoutId
            WHERE w.userId = ?
            GROUP BY w.workoutId, w.date, w.duration
            ORDER BY w.date DESC
            LIMIT 5`;
        const [workouts] = await pool.query(sql, [req.session.userId]);

        // to get workout stats
        sql = `
            SELECT 
                COUNT(DISTINCT workoutId) as totalWorkouts,
                SUM(duration) as totalMinutes,
                COUNT(DISTINCT DATE_FORMAT(date, '%Y-%m')) as monthsActive
            FROM workouts 
            WHERE userId = ?`;
        const [stats] = await pool.query(sql, [req.session.userId]);

        // fetch quote from API
        const quote = await motivationalQuote();

        // load dashboard with info
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

// route to display workout log
app.get("/workout/log", isAuthenticated, async (req, res) => {
    try {
        let sql = `
            SELECT exerciseId, nameOfExercise, muscleGroup, equipment, imageURL 
            FROM exercises 
            ORDER BY muscleGroup, nameOfExercise`;
        const [exercises] = await pool.query(sql);

        // load the workout log
        res.render("log-workout", {
            user: req.session,
            exercises: exercises
        });
    }
    catch (error) {
        console.error("Log workout page error:", error);
        res.status(500).send("Error loading workout form");
    }
});

// route to post a workout (to be referred to later)
app.post("/workout/log", isAuthenticated, async (req, res) => {
    const { date, duration, exercises } = req.body;

    try {
        let sql = `
            INSERT INTO workouts (userId, date, duration) 
            VALUES (?, ?, ?)`;
        const [result] = await pool.query(sql, [
            req.session.userId,
            date,
            duration
        ]);

        const workoutId = result.insertId;

        // if exercise selected, choose a group
        if (exercises && Array.isArray(exercises)) {
            sql = `
                INSERT INTO workoutGroups 
                (workoutId, muscleGroup, exerciseId, sets, reps, weight) 
                VALUES (?, ?, ?, ?, ?, ?)`;

            // Loop through each exercise and insert into workoutGroups
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
        console.error("Log workout submission error:", error);
        res.status(500).json({ success: false, error: "Failed to save workout" });
    }
});

// route to get user's workout history
app.get("/workout/history", isAuthenticated, async (req, res) => {
    try {
        let sql = `
            SELECT w.workoutId, w.date, w.duration,
                   GROUP_CONCAT(DISTINCT e.nameOfExercise SEPARATOR ', ') as exercises,
                   SUM(wg.sets * wg.reps * wg.weight) as totalVolume
            FROM workouts w
            LEFT JOIN workoutGroups wg ON w.workoutId = wg.workoutId
            LEFT JOIN exercises e ON wg.exerciseId = e.exerciseId
            WHERE w.userId = ?
            GROUP BY w.workoutId, w.date, w.duration
            ORDER BY w.date DESC`;
        const [workouts] = await pool.query(sql, [req.session.userId]);

        // Render workout history page
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

// route to get workout
app.get("/workout/:id", isAuthenticated, async (req, res) => {
    try {
        // query for basic workout info
        let sql = `
            SELECT workoutId, userId, date, duration 
            FROM workouts 
            WHERE workoutId = ? AND userId = ?`;
        const [workout] = await pool.query(sql, [
            req.params.id,
            req.session.userId
        ]);

        // does workout exist??
        if (workout.length === 0) {
            return res.status(404).send("Workout not found");
        }

        // query to retrieve all exercises from this workout
        sql = `
            SELECT wg.groupId, wg.sets, wg.reps, wg.weight, wg.muscleGroup,
                   e.exerciseId, e.nameOfExercise, e.imageURL, e.equipment
            FROM workoutGroups wg
            JOIN exercises e ON wg.exerciseId = e.exerciseId
            WHERE wg.workoutId = ?
            ORDER BY wg.groupId`;
        const [exerciseGroups] = await pool.query(sql, [req.params.id]);

        // load workout detail page
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

// route to get user's progress over time
app.get("/progress", isAuthenticated, async (req, res) => {
    try {
        let sql = `
            SELECT progressId, chestDiameter, armDiameter, shoulderDiameter, 
                   legDiameter, hipDiameter, recordedDate 
            FROM userProgress 
            WHERE userId = ? 
            ORDER BY recordedDate DESC`;
        const [progressData] = await pool.query(sql, [req.session.userId]);

        // Render progress tracking page
        res.render("progress", {
            user: req.session,
            progressData: progressData
        });
    } catch (error) {
        console.error("Progress page error:", error);
        res.status(500).send("Error loading progress data");
    }
});

// route to post progress 
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
        res.status(500).json({ success: false, error: "Failed to save progress" });
    }
});

// route to get exerises
app.get("/exercises", isAuthenticated, async (req, res) => {
    try {
        let sql = `
            SELECT exerciseId, nameOfExercise, muscleGroup, equipment, 
                   instructions, imageURL, apiSource 
            FROM exercises 
            ORDER BY muscleGroup, nameOfExercise`;
        const [exercises] = await pool.query(sql);

        sql = `
            SELECT DISTINCT muscleGroup 
            FROM exercises 
            ORDER BY muscleGroup`;
        const [muscleGroups] = await pool.query(sql);

        // exercise library page
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

// route to get user's profile info
app.get("/profile", isAuthenticated, async (req, res) => {
    try {
        let sql = `
            SELECT userId, name, email, height, weight, goals, createdAt 
            FROM userInfo 
            WHERE userId = ?`;
        const [userInfo] = await pool.query(sql, [req.session.userId]);

        res.render("profile", {
            user: req.session,
            userInfo: userInfo[0]
        });
    }
    catch (error) {
        console.error("Profile page error:", error);
        res.status(500).send("Error loading profile");
    }
});

// route to update user's profile info
app.post("/profile/update", isAuthenticated, async (req, res) => {
    const { email, height, weight, goals } = req.body;

    try {
        // Update user information in database
        let sql = `
            UPDATE userInfo 
            SET email = ?, height = ?, weight = ?, goals = ? 
            WHERE userId = ?`;
        await pool.query(sql, [
            email,
            height || null,
            weight || null,
            goals || null,
            req.session.userId
        ]);

        // email changed --> update session
        req.session.userEmail = email;

        res.json({ success: true });
    }
    catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ success: false, error: "Failed to update profile" });
    }
});

// route to get motivational quote from API
app.get("/api/quote", async (req, res) => {
    const quote = await motivationalQuote();
    res.json(quote);
});

// route to get a log of a workout
app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
        // workout logs
        let sql = `
            SELECT COUNT(DISTINCT workoutId) as totalWorkouts,
                   SUM(duration) as totalMinutes,
                   DATEDIFF(MAX(date), MIN(date)) as daysActive
            FROM workouts
            WHERE userId = ?`;
        const [stats] = await pool.query(sql, [req.session.userId]);

        // Return statistics as JSON
        res.json(stats[0]);
    }
    catch (error) {
        console.error("Stats API error:", error);
        res.status(500).json({ error: "Failed to fetch statistics" });
    }
});

// route to retrieve exercises from API
app.get("/api/exercises/search", isAuthenticated, async (req, res) => {
    try {
        // Extract search query from URL parameters
        const { query } = req.query;

        // Search exercises by name or muscle group (case-insensitive)
        let sql = `
            SELECT exerciseId, nameOfExercise, muscleGroup, equipment, imageURL 
            FROM exercises 
            WHERE nameOfExercise LIKE ? OR muscleGroup LIKE ?
            ORDER BY nameOfExercise
            LIMIT 20`;
        const [exercises] = await pool.query(sql, [`%${query}%`, `%${query}%`]);

        // Return search results as JSON
        res.json(exercises);
    }
    catch (error) {
        console.error("Exercise search error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

// error page
app.use((req, res) => {
    res.status(404).send("Page not found");
});

app.listen(3000, ()=>{
    console.log("Express server running")
})

//routes
app.get('/', (req, res) => {
   res.render('index')
});

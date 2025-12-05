CREATE TABLE userInfo (
    userId INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    goals TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE userProgress (
    progressId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    chestDiameter DECIMAL(5,2),
    armDiameter DECIMAL(5,2),
    shoulderDiameter DECIMAL(5,2),
    legDiameter DECIMAL(5,2),
    hipDiameter DECIMAL(5,2),
    recordedDate DATE NOT NULL,
    FOREIGN KEY (userId) REFERENCES userInfo(userId) ON DELETE CASCADE
);

CREATE TABLE exercises (
    exerciseId INT PRIMARY KEY AUTO_INCREMENT,
    nameOfExercise VARCHAR(150) NOT NULL,
    muscleGroup VARCHAR(50) NOT NULL,
    equipment VARCHAR(100),
    instructions TEXT,
    imageURL VARCHAR(255),
    apiSource VARCHAR(100)
);

CREATE TABLE workouts (
    workoutId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    date DATE NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    FOREIGN KEY (userId) REFERENCES userInfo(userId) ON DELETE CASCADE
);

CREATE TABLE workoutGroups (
    groupId INT PRIMARY KEY AUTO_INCREMENT,
    workoutId INT NOT NULL,
    muscleGroup VARCHAR(50) NOT NULL,
    exerciseId INT NOT NULL,
    sets INT,
    reps INT,
    weight DECIMAL(5,2),
    FOREIGN KEY (workoutId) REFERENCES workouts(workoutId) ON DELETE CASCADE,
    FOREIGN KEY (exerciseId) REFERENCES exercises(exerciseId) ON DELETE CASCADE
);

CREATE TABLE workoutRoutine (
    routineId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    routineName VARCHAR(100) NOT NULL,
    exerciseJSON JSON NOT NULL,
    createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES userInfo(userId) ON DELETE CASCADE
);

INSERT INTO userInfo (name, email, password, height, weight, goals) VALUES
('John Doe', 'john.doe@email.com', 'password1', 180.00, 85.50, 'Build muscle mass and increase strength'),
('Jane Smith', 'jane.smith@email.com', 'password2', 165.00, 62.00, 'Lose weight and improve cardiovascular health'),
('James Johnson', 'mike.j@email.com', 'password3', 175.00, 78.00, 'Maintain fitness and flexibility'),
('Sarah Vasquez', 'sarah.v@email.com', 'password4', 170.00, 68.50, 'Train for marathon and endurance');

INSERT INTO userProgress (userId, chestDiameter, armDiameter, shoulderDiameter, legDiameter, hipDiameter, recordedDate) VALUES
(1, 102.00, 35.50, 48.00, 58.00, 95.00, '2024-01-15'),
(1, 104.00, 36.00, 49.00, 59.00, 94.50, '2024-02-15'),
(2, 88.00, 28.00, 42.00, 52.00, 92.00, '2024-01-15'),
(2, 86.50, 27.50, 41.50, 51.00, 90.00, '2024-02-15'),
(3, 98.00, 33.00, 46.00, 56.00, 93.00, '2024-01-20'),
(4, 90.00, 29.00, 43.00, 54.00, 94.00, '2024-01-25');

INSERT INTO exercises (nameOfExercise, muscleGroup, equipment, instructions, imageURL, apiSource) VALUES
('Barbell Bench Press', 'Chest', 'Barbell', 'Lie on bench, lower bar to chest, press up to full extension', 'https://example.com/bench-press.jpg', 'ExerciseDB'),
('Dumbbell Bicep Curl', 'Biceps', 'Dumbbells', 'Stand with dumbbells, curl weights up to shoulders, lower slowly', 'https://example.com/bicep-curl.jpg', 'ExerciseDB'),
('Barbell Squat', 'Legs', 'Barbell', 'Bar on shoulders, squat down until thighs parallel, drive up', 'https://example.com/squat.jpg', 'ExerciseDB'),
('Pull-ups', 'Back', 'Pull-up Bar', 'Hang from bar, pull body up until chin over bar, lower slowly', 'https://example.com/pullups.jpg', 'ExerciseDB'),
('Shoulder Press', 'Shoulders', 'Dumbbells', 'Press dumbbells overhead from shoulder height, lower controlled', 'https://example.com/shoulder-press.jpg', 'ExerciseDB'),
('Deadlift', 'Back', 'Barbell', 'Lift bar from ground to hip level, keep back straight, lower controlled', 'https://example.com/deadlift.jpg', 'ExerciseDB'),
('Tricep Dips', 'Triceps', 'Dip Bar', 'Lower body by bending elbows, push back up to start', 'https://example.com/dips.jpg', 'ExerciseDB'),
('Leg Press', 'Legs', 'Leg Press Machine', 'Push platform away with feet, return slowly to start', 'https://example.com/leg-press.jpg', 'ExerciseDB'),
('Plank', 'Core', 'Bodyweight', 'Hold body straight in push-up position on forearms', 'https://example.com/plank.jpg', 'ExerciseDB'),
('Running', 'Cardio', 'Treadmill', 'Maintain steady pace for cardiovascular conditioning', 'https://example.com/running.jpg', 'Manual');

INSERT INTO workouts (userId, date, duration) VALUES
(1, '2024-11-28', 60),
(1, '2024-11-30', 45),
(2, '2024-11-29', 50),
(3, '2024-11-27', 55),
(4, '2024-11-28', 70);

INSERT INTO workoutGroups (workoutId, muscleGroup, exerciseId, sets, reps, weight) VALUES
(1, 'Chest', 1, 4, 8, 80.00),
(1, 'Biceps', 2, 3, 12, 15.00),
(1, 'Triceps', 7, 3, 10, 0.00),
(2, 'Legs', 3, 4, 10, 100.00),
(2, 'Legs', 8, 3, 12, 150.00),
(3, 'Back', 4, 3, 8, 0.00),
(3, 'Shoulders', 5, 3, 10, 20.00),
(4, 'Back', 6, 4, 6, 120.00),
(4, 'Core', 9, 3, 60, 0.00),
(5, 'Cardio', 10, 1, 1, 0.00);

SELECT 'UserInfo Count:' as Info, COUNT(*) as Count FROM userInfo;
SELECT 'Exercises Count:' as Info, COUNT(*) as Count FROM exercises;
SELECT 'Workouts Count:' as Info, COUNT(*) as Count FROM workouts;
document.addEventListener('DOMContentLoaded', () =>{
    init();
});

//Initialize App
function init(){
    loadMotivationQuote();
    handleWorkoutForm();
    handleProfileForm();
    handleProgressForm();
}

async function loadMotivationQuote(){
    const res = await fetch("/api/quote");
    const data = await res.json();

    const quoteDiv = document.getElementById("insp-quote");
    const authorDiv = document.getElementById("quote-a=[thor");

    if(quoteDiv){
        quoteDiv.textContent = `"${data.content}"`;
    }

    if(authorDiv){
        authorDiv.textContent = `— ${data.author}`;
    }
}

function handleWorkoutForm(){
    const workoutForm = document.getElementById("workout-form");
    if(!workoutForm) return;

    workoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const date = document.getElementById("workout-date").value;
        const duration = document.getElementById("workout-duration").value;

        const exercises = [];
        document.querySelectorAll(".exercise-row").forEach(row => {
            exercises.push({
                exerciseId: row.querySelector(".exerciseId").value,
                sets: row.querySelector(".sets").value,
                reps: row.querySelector(".reps").value,
                weight: row.querySelector(".weight").value,
                muscleGroup: row.querySelector(".muscleGroup").value
            });
        });

        const data = { date, duration, exercises };

        const res = await fetch("/workout/log", {
            method: "POST", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if(result.success) {
            alert("Workout logged successfully!");
            workoutForm.reset();
            document.getElementById("exercise-list").innerHTML = "";
        } else {
            alert("Failed to log workout.");
        }
    });
}

function handleProfileForm(){
    const profileForm = document.getElementById("profile-form");
    if(!profileForm) return;

    profileForm.addEventListener("submit", async(e) => {
        e.preventDefault();

        const email = document.getElementById("profile-email").value;
        const height = document.getElementById("profile-height").value;
        const weight = document.getElementById("profile-weight").value;
        const goals = document.getElementById("profile-goals") ? document.getElementById("profile-goals").value : "";

        const data = { email, height, weight, goals};

        const res = await fetch("/profile/update", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();
        alert(result.success ? "Profile updated!": "Update failed.");
    });
}

function handleProgressForm(){
    const progressForm = document.getElementById("progress-form");
    if(!progressForm) return;

    progressForm.addEventListener("submit", async (e) =>{
        e.preventDefault();

        const chestDiameter = document.getElementById("chestDiameter").value;
        const armDiameter = document.getElementById("armDiameter").value;
        const shoulderDiameter = document.getElementById("shoulderDiameter").value;
        const legDiameter = document.getElementById("legDiameter").value;
        const hipDiameter = document.getElementById("hipDiameter").value;
        const recordedDate = document.getElementById("recordedDate").value;

        const data = { chestDiameter, armDiameter, shoulderDiameter, legDiameter, hipDiameter, recordedDate};

        const res = await fetch("/progress/add", {
            method: "POST", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();
        alert(result.success ? "Progress added!" : "Failed to add progress.");
        if (result.success) progressForm.reset();
    });
}
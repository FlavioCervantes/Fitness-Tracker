document.addEventListener('DOMContentLoaded', () =>{
    init();
});

//Initialize App
function init(){
    //Functions to be implemented later
    loadMotivationQuote();
    setupExerciseSearch();
    restoreLastExercise();
    handleWorkoutForm();
    handleProfileForm();
    handleProgressForm();
}

async function loadMotivationQuote(){
    const res = await fetch("/api/quote");
    const data = await res.json();

    const quoteDiv = document.getElementById("quote");
    if(quoteDiv){
        quoteDiv.innerHTML = `"${data.content}" — ${data.author}`;
    }
}

function setupExerciseSearch(){
    const searchInput = document.getElementById("exerciseSearch");
    if(!searchInput) return;

    searchInput.addEventListener("input", async (e) => {
        const query = e.target.value;
        if(query.length < 2 ) return;

        const res = await fetch(`/api/exercise/search?query=${query}`);
        const exercise = await res.json();

        const resultDiv = document.getElementById("searchResults");
        resultDiv.innerHTML = exercise.map(ex => `
            <div>
                <h4>${ex.nameOfExercise}</h4>
                <p>${ex.muscleGroup}</p>
                <img src="${ex.imageURL}" alt="${ex.nameOfExercise}" width="100">
            </div>`).join("");
    });
}

function restoreLastExercise(){
    const searchInput = document.getElementById("exerciseSearch");
    if(searchInput){
        searchInput.value = localStorage.getItem("lastExercise") || "";
    }
}

function handleWorkoutForm(){
    const workoutForm = document.getElementById("workoutForm");
    if(!workoutForm) return;

    workoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(workoutForm);
        const exercises = [];

        document.querySelectorAll(".exercise-row").forEach(row => {
            exercise.push({
                exerciseId: row.querySelector(".exerciseId").value,
                sets: row.querySelector(".sets").value,
                reps: row.querySelector(".reps").value,
                weight: row.querySelector(".weight").value,
                muscleGroup: row.querySelector(".muscleGroup").value
            });
        });

        const data = {
            data: formData.get("date"), 
            duration: formData.get("duration"),
            exercises
        };

        const res = await fetch("/workout/log", {
            method: "POST", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if(result.success) {
            alert("Workout logged successfully!");
            workoutForm.reset();
        } else {
            alert("Faield to log workout.");
        }
    });
}

function handleProfileForm(){
    const profileForm = document.getElementById("profileForm");
    if(!profileForm) return;

    profileForm.addEventListener("submit", async(e) => {
        e.preventDefault();

        const formData = new FormData(profileForm);
        const data = {
            email: formData.get("email"),
            height: formData.get("height"),
            weight: formData.get("weight"),
            goals: formData.get("goals")
        };

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
    const progressForm = document.getElementById("progressForm");
    if(!progressForm) return;

    progressForm.addEventListener("submit", async (e) =>{
        e.preventDefault();

        const formData = new FormData(progressForm);
        const data = {
            chestDiameter: formData.get("chestDiameter"), 
            armDiameter: formData.get("armDiameter"), 
            shoulderDiameter: formData.get("shoulderDiameter"),
            legDiameter: formData.get("legDiameter"), 
            hipDiameter: formData.get("hipDiameter"),
            recordedDate: formData.get("recordedDate")
        };

        const res = await fetch("/progress/add", {
            method: "POST", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();
        alert(result.success ? "Progress added!" : "Failed to add progressForm.");
        if (result.success) progressForm.reset();
    });
}
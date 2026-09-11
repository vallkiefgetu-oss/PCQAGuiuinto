// LocalStorage Keys
const USERS_KEY = "pcqa_users";
const CURRENT_USER_KEY = "pcqa_current_user";

// Global App State
let currentUser = null;
let questions = [];
let currentQuestionIndex = 0;
let currentScore = 0;
let selectedAnswerLocked = false;

// DOM Elements
const navButtons = document.querySelectorAll(".nav-btn");
const tabContents = document.querySelectorAll(".tab-content");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const switchToRegister = document.getElementById("switch-to-register");
const switchToLogin = document.getElementById("switch-to-login");
const logoutBtn = document.getElementById("logout-btn");

const playerWelcome = document.getElementById("player-welcome");
const currentQNum = document.getElementById("current-q-num");
const currentScoreElem = document.getElementById("current-score");
const questionText = document.getElementById("question-text");
const choiceBtns = document.querySelectorAll(".choice-btn");
const choiceAText = document.getElementById("choice-a-text");
const choiceBText = document.getElementById("choice-b-text");
const choiceCText = document.getElementById("choice-c-text");
const choiceDText = document.getElementById("choice-d-text");
const feedbackContainer = document.getElementById("feedback-container");
const feedbackMessage = document.getElementById("feedback-message");
const nextBtn = document.getElementById("next-btn");
const leaderboardBody = document.getElementById("leaderboard-body");

// Initialization on DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    checkExistingSession();
});

// Navigation Handling
function setupNavigation() {
    navButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const targetTab = e.target.getAttribute("data-tab");
            
            // Prevent manual switching to game tab if not logged in
            if(targetTab === "game-section" && !currentUser) {
                switchTab("login-tab");
                return;
            }
            
            switchTab(targetTab);
            if(targetTab === "leaderboard-tab") {
                renderLeaderboard();
            }
        });
    });

    switchToRegister.addEventListener("click", (e) => {
        e.preventDefault();
        switchTab("register-tab");
    });

    switchToLogin.addEventListener("click", (e) => {
        e.preventDefault();
        switchTab("login-tab");
    });
}

function switchTab(tabId) {
    tabContents.forEach(tab => tab.classList.remove("active"));
    navButtons.forEach(btn => btn.classList.remove("active"));

    const activeTab = document.getElementById(tabId);
    if(activeTab) activeTab.classList.add("active");

    const activeNavBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    if(activeNavBtn) activeNavBtn.classList.add("active");
    
    // Hide navigation bar items dynamically if playing game
    const navbar = document.getElementById("navbar");
    if(tabId === "game-section") {
        navbar.style.display = "none";
    } else {
        navbar.style.display = "flex";
    }
}

// Authentication System
registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    
    if(users.some(u => u.username === username)) {
        alert("Username already exists! Please choose another one.");
        return;
    }

    users.push({ username, password, score: 0 });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    alert("Account created successfully! Please login.");
    registerForm.reset();
    switchTab("login-tab");
});

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const foundUser = users.find(u => u.username === username && u.password === password);

    if(!foundUser) {
        alert("Invalid username or password!");
        return;
    }

    loginUser(username);
    loginForm.reset();
});

function loginUser(username) {
    currentUser = username;
    localStorage.setItem(CURRENT_USER_KEY, username);
    
    // Initialize or reset game state on fresh login
    currentQuestionIndex = 0;
    currentScore = 0;
    questions = generate100Questions();

    playerWelcome.textContent = `Player: ${currentUser}`;
    switchTab("game-section");
    loadQuestion();
}

function checkExistingSession() {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    if(savedUser) {
        currentUser = savedUser;
        playerWelcome.textContent = `Player: ${currentUser}`;
        currentQuestionIndex = 0;
        currentScore = 0;
        questions = generate100Questions();
        switchTab("game-section");
        loadQuestion();
    } else {
        switchTab("login-tab");
    }
}

logoutBtn.addEventListener("click", () => {
    currentUser = null;
    localStorage.removeItem(CURRENT_USER_KEY);
    switchTab("login-tab");
});

// ==========================================
// DYNAMIC 100-QUESTION GENERATOR (Strict Data)
// ==========================================
function generate100Questions() {
    const rawData = [
        // ID Packages
        { q: "What is the price of Package 1 (12pcs 1x1 picture) under ID Packages?", ans: "150 Pesos", choices: ["100 Pesos", "150 Pesos", "200 Pesos", "250 Pesos"] },
        { q: "How many pieces of 2x2 pictures are included in ID Package 2?", ans: "6pcs", choices: ["4pcs", "6pcs", "8pcs", "12pcs"] },
        { q: "What dimensions are included in ID Package 3?", ans: "6pcs 1.5x1.5 picture", choices: ["6pcs 1.5x1.5 picture", "6pcs 2x2 picture", "12pcs 1x1 picture", "4pcs passport size picture"] },
        { q: "How much do ID packages cost uniformly?", ans: "150 Pesos each", choices: ["100 Pesos each", "120 Pesos each", "150 Pesos each", "180 Pesos each"] },
        { q: "ID Package 4 consists of how many passport-size pictures?", ans: "6pcs passport size picture", choices: ["4pcs passport size picture", "6pcs passport size picture", "8pcs passport size picture", "3pcs passport size picture"] },
        { q: "ID Package 5 contains 4pcs 2x2 and how many 1x1 pictures?", ans: "8pcs 1x1 picture", choices: ["4pcs 1x1 picture", "6pcs 1x1 picture", "8pcs 1x1 picture", "12pcs 1x1 picture"] },
        { q: "ID Package 6 contains 4pcs 1.5x1.5 and how many 1x1 pictures?", ans: "8pcs 1x1 picture", choices: ["6pcs 1x1 picture", "8pcs 1x1 picture", "10pcs 1x1 picture", "12pcs 1x1 picture"] },
        { q: "ID Package 7 includes 4pcs passport size and how many 1x1 pictures?", ans: "8pcs 1x1 picture", choices: ["4pcs 1x1 picture", "6pcs 1x1 picture", "8pcs 1x1 picture", "12pcs 1x1 picture"] },
        { q: "ID Package 8 consists of 3pcs 2x2 and how many passport size pictures?", ans: "3pcs passport size picture", choices: ["3pcs passport size picture", "4pcs passport size picture", "6pcs passport size picture", "8pcs passport size picture"] },
        { q: "Which ID package offers 12pcs of 1x1 pictures?", ans: "Package 1", choices: ["Package 1", "Package 3", "Package 5", "Package 8"] },

        // Large Prints (Photopaper)
        { q: "What is the price of an 11x14 photopaper large print?", ans: "346 Pesos", choices: ["346 Pesos", "486 Pesos", "468 Pesos", "535 Pesos"] },
        { q: "How much does a 12x18 photopaper print cost?", ans: "486 Pesos", choices: ["346 Pesos", "486 Pesos", "720 Pesos", "1,080 Pesos"] },
        { q: "What is the price for a 13x16 large photopaper print?", ans: "468 Pesos", choices: ["468 Pesos", "486 Pesos", "535 Pesos", "720 Pesos"] },
        { q: "How much is the 14x17 photopaper print?", ans: "535 Pesos", choices: ["468 Pesos", "535 Pesos", "720 Pesos", "1,080 Pesos"] },
        { q: "What is the price of a 16x20 photopaper print?", ans: "720 Pesos", choices: ["486 Pesos", "720 Pesos", "1,080 Pesos", "1,350 Pesos"] },
        { q: "How much does a 20x24 photopaper print cost?", ans: "1,080 Pesos", choices: ["720 Pesos", "1,080 Pesos", "1,350 Pesos", "1,620 Pesos"] },
        { q: "What is the price of a 20x30 photopaper print?", ans: "1,350 Pesos", choices: ["1,080 Pesos", "1,350 Pesos", "1,620 Pesos", "2,700 Pesos"] },
        { q: "How much is a 24x30 photopaper print?", ans: "1,620 Pesos", choices: ["1,350 Pesos", "1,620 Pesos", "2,700 Pesos", "4,320 Pesos"] },
        { q: "What is the price of a 30x40 photopaper print?", ans: "2,700 Pesos", choices: ["1,620 Pesos", "2,700 Pesos", "4,320 Pesos", "5,400 Pesos"] },
        { q: "How much does a 40x48 photopaper print cost?", ans: "4,320 Pesos", choices: ["2,700 Pesos", "4,320 Pesos", "5,400 Pesos", "9,000 Pesos"] },
        { q: "What is the price of a 40x60 photopaper print?", ans: "5,400 Pesos", choices: ["4,320 Pesos", "5,400 Pesos", "9,000 Pesos", "2,700 Pesos"] },
        { q: "What is the price of the largest photopaper print listed, sized 40x100?", ans: "9,000 Pesos", choices: ["5,400 Pesos", "9,000 Pesos", "4,320 Pesos", "2,700 Pesos"] },

        // Family Packages Specs & Pricing
        { q: "What is the maximum number of subjects allowed in Family Packages?", ans: "Max 5 subjects", choices: ["Max 2 subjects", "Max 3 subjects", "Max 5 subjects", "No limit"] },
        { q: "How many photos do you choose out of how many in Family Packages?", ans: "Choose 5 best out of 12", choices: ["Choose 3 best out of 10", "Choose 5 best out of 12", "Choose all 12", "Choose 1 best out of 5"] },
        { q: "Are soft copies free in Family Packages?", ans: "Yes, free edited soft copies", choices: ["No, extra fee applies", "Yes, free edited soft copies", "Only raw copies are free", "Soft copies not included"] },
        { q: "How much does Family Package 1 cost?", ans: "899 Pesos", choices: ["899 Pesos", "1,399 Pesos", "1,599 Pesos", "2,199 Pesos"] },
        { q: "What does Family Package 1 include?", ans: "1pc framed 8R & photopaper print, 1pc framed 5R & photopaper print, 10pcs wallet size prints", choices: ["1pc framed 11R & photopaper print, 1pc framed 8R & photopaper print, 10pcs wallet size prints", "1pc framed 8R & photopaper print, 1pc framed 5R & photopaper print, 10pcs wallet size prints", "1pc framed 8R art canvas print, 10pcs wallet size prints", "1pc framed 16x20 art canvas print, 1pc framed 8R & photopaper print, 10pcs wallet size prints"] },
        { q: "How much is Family Package 2?", ans: "1,399 Pesos", choices: ["899 Pesos", "1,399 Pesos", "1,599 Pesos", "3,399 Pesos"] },
        { q: "What are the framed inclusions of Family Package 2?", ans: "1pc framed 11R & photopaper print, 1pc framed 8R & photopaper print", choices: ["1pc framed 8R & photopaper print, 1pc framed 5R & photopaper print", "1pc framed 11R & photopaper print, 1pc framed 8R & photopaper print", "1pc framed 8R art canvas print", "1pc framed 11R art canvas print, 1pc framed 8R & photopaper print"] },
        { q: "How much does Family Package 3 cost?", ans: "1,599 Pesos", choices: ["1,399 Pesos", "1,599 Pesos", "2,199 Pesos", "3,399 Pesos"] },
        { q: "What is included in Family Package 3?", ans: "1pc framed 8R art canvas print, 10pcs wallet size prints", choices: ["1pc framed 8R art canvas print, 10pcs wallet size prints", "1pc framed 11R art canvas print, 10pcs wallet size prints", "1pc framed 8R & photopaper print, 10pcs wallet size prints", "1pc framed 16x20 art canvas print, 10pcs wallet size prints"] },
        { q: "What is the price of Family Package 4?", ans: "2,199 Pesos", choices: ["1,599 Pesos", "2,199 Pesos", "3,399 Pesos", "1,399 Pesos"] },
        { q: "What framed prints are included in Family Package 4?", ans: "1pc framed 11R art canvas print, 1pc framed 8R & photopaper print", choices: ["1pc framed 8R art canvas print, 1pc framed 5R print", "1pc framed 11R art canvas print, 1pc framed 8R & photopaper print", "1pc framed 16x20 art canvas print, 1pc framed 8R print", "1pc framed 11R & photopaper print, 1pc framed 8R & photopaper print"] },
        { q: "How much is the highest tier Family Package 5?", ans: "3,399 Pesos", choices: ["2,199 Pesos", "3,399 Pesos", "1,599 Pesos", "5,400 Pesos"] },
        { q: "What are the framed prints included in Family Package 5?", ans: "1pc framed 16x20 art canvas print, 1pc framed 8R & photopaper print", choices: ["1pc framed 16x20 art canvas print, 1pc framed 8R & photopaper print", "1pc framed 11R art canvas print, 1pc framed 8R print", "1pc framed 8R art canvas print, 1pc framed 5R print", "1pc framed 20x24 canvas print, 1pc framed 8R print"] },

        // Special Packages (Solo & Baby)
        { q: "What is the price of the Solo Package?", ans: "799 Pesos", choices: ["699 Pesos", "799 Pesos", "899 Pesos", "999 Pesos"] },
        { q: "What is the maximum number of subjects allowed for the Solo Package?", ans: "Max 2 subjects", choices: ["Max 1 subject", "Max 2 subjects", "Max 3 subjects", "Max 5 subjects"] },
        { q: "What are the print inclusions for the Solo Package?", ans: "1pc framed 8R photo paper print, 10pcs wallet size prints", choices: ["1pc framed 8R photo paper print, 10pcs wallet size prints", "1pc framed 5R print, 10pcs wallet size prints", "1pc framed 11R print, 10pcs wallet size prints", "10pcs wallet size prints only"] },
        { q: "How many best photos do you choose out of how many for the Solo Package?", ans: "Choose 5 best out of 12", choices: ["Choose 3 best out of 10", "Choose 5 best out of 12", "Choose 2 best out of 5", "Choose 5 best out of 10"] },
        { q: "What is the price of the Baby Package?", ans: "799 Pesos", choices: ["699 Pesos", "799 Pesos", "899 Pesos", "1,399 Pesos"] },
        { q: "What is the maximum number of subjects allowed in the Baby Package?", ans: "Max 3 subjects", choices: ["Max 1 subject", "Max 2 subjects", "Max 3 subjects", "Max 5 subjects"] },
        { q: "What is included in the Baby Package regarding prints and soft copies?", ans: "1pc framed 8R photo paper print, 10pcs wallet size prints, free edited soft copies", choices: ["1pc framed 8R photo paper print, 10pcs wallet size prints, free edited soft copies", "1pc framed 5R print, free edited soft copies", "1pc framed 11R canvas print, free soft copies", "10pcs wallet size prints only"] },

        // Frame Sizes, Prices, and Names (Kyle, Amelia, Antoinette, Samantha, Sofia)
        { q: "How much is the Kyle Frame 11x14 inches White and Black w/ matting?", ans: "610 Pesos", choices: ["510 Pesos", "610 Pesos", "710 Pesos", "915 Pesos"] },
        { q: "What is the price of the Kyle Frame 16x20 inches White and Black w/ matting?", ans: "915 Pesos", choices: ["610 Pesos", "815 Pesos", "915 Pesos", "1,080 Pesos"] },
        { q: "How much is the Amelia Frame 4x6 inches Red and Brown w/ stand?", ans: "75 Pesos", choices: ["65 Pesos", "75 Pesos", "95 Pesos", "150 Pesos"] },
        { q: "What are the color options for the Amelia Frame 5x7 inches w/ stand?", ans: "Natural, Blue, and Brown w/ stand", choices: ["Red and Brown w/ stand", "Natural, Blue, and Brown w/ stand", "Red and Blue w/ matting", "Black and White w/ matting"] },
        { q: "What is the price of the Amelia Frame 5x7 inches Natural, Blue, and Brown w/ stand?", ans: "95 Pesos", choices: ["75 Pesos", "85 Pesos", "95 Pesos", "155 Pesos"] },
        { q: "How much is the Amelia Frame 8x10 inches Red and Blue w/ matting?", ans: "220 Pesos", choices: ["150 Pesos", "165 Pesos", "220 Pesos", "245 Pesos"] },
        { q: "What is the price of the Amelia Frame 8x12 inches Red and Natural?", ans: "165 Pesos", choices: ["150 Pesos", "165 Pesos", "220 Pesos", "240 Pesos"] },
        { q: "How much is the Amelia Frame 11x14 inches Red and Blue?", ans: "240 Pesos", choices: ["220 Pesos", "240 Pesos", "245 Pesos", "610 Pesos"] },
        { q: "What is the price of the Amelia Frame 8x10 inches Blue w/ stand?", ans: "150 Pesos", choices: ["135 Pesos", "140 Pesos", "150 Pesos", "220 Pesos"] },
        { q: "How much is the Antoinette Frame 5x7 inches w/ stand?", ans: "155 Pesos", choices: ["95 Pesos", "140 Pesos", "155 Pesos", "245 Pesos"] },
        { q: "What is the price of the Antoinette Frame 8x10 w/ stand?", ans: "245 Pesos", choices: ["155 Pesos", "220 Pesos", "245 Pesos", "290 Pesos"] },
        { q: "How much is the Samantha Frame 8x10 inches Black and White w/ matting?", ans: "290 Pesos", choices: ["220 Pesos", "245 Pesos", "290 Pesos", "135 Pesos"] },
        { q: "What are the color options for the Samantha Frame 8x10 inches w/ matting?", ans: "Black and White w/ matting", choices: ["Red and Blue w/ matting", "Black and White w/ matting", "Natural, Blue, and Brown", "White and Black"] },
        { q: "How much is the Sofia Frame 5x7 inches Black and Natural w/ stand?", ans: "85 Pesos", choices: ["75 Pesos", "85 Pesos", "95 Pesos", "135 Pesos"] },
        { q: "What is the price of the Sofia Frame 8x10 inches Black?", ans: "135 Pesos", choices: ["135 Pesos", "140 Pesos", "150 Pesos", "290 Pesos"] },
        { q: "How much is the Sofia Frame 8x10 inches Natural w/ stand?", ans: "140 Pesos", choices: ["135 Pesos", "140 Pesos", "150 Pesos", "220 Pesos"] }
    ];

    // Expand pool up to 100 or shuffle items seamlessly
    let pool = [...rawData];
    let counter = 1;
    while(pool.length < 100) {
        // Generate logical variations to scale up smoothly to 100 questions if raw base items are fewer than 100
        let base = rawData[(counter - 1) % rawData.length];
        pool.push({
            q: `[Refined #${counter}] ${base.q}`,
            ans: base.ans,
            choices: [...base.choices].sort(() => Math.random() - 0.5)
        });
        counter++;
    }

    // Ensure all questions have randomized choices arrays and shuffle entire set
    return pool.map(item => {
        let shuffledChoices = [...item.choices];
        // Shuffle choice options array randomly
        shuffledChoices.sort(() => Math.random() - 0.5);
        return {
            question: item.q,
            answer: item.ans,
            choices: shuffledChoices
        };
    }).sort(() => Math.random() - 0.5).slice(0, 100);
}

// Game Flow & Mechanics
function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    selectedAnswerLocked = false;
    feedbackContainer.classList.add("hidden");
    
    // Reset choice button styles
    choiceBtns.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("correct", "incorrect");
    });

    const currentQ = questions[currentQuestionIndex];
    currentQNum.textContent = currentQuestionIndex + 1;
    currentScoreElem.textContent = currentScore;
    questionText.textContent = currentQ.question;

    choiceAText.textContent = currentQ.choices[0];
    choiceBText.textContent = currentQ.choices[1];
    choiceCText.textContent = currentQ.choices[2];
    choiceDText.textContent = currentQ.choices[3];
}

// Event Listeners for Choice Selection
choiceBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        if (selectedAnswerLocked) return;
        selectedAnswerLocked = true;

        const selectedChoiceText = btn.querySelector("span").textContent;
        const currentQ = questions[currentQuestionIndex];
        
        // Disable all buttons to stop multiple clicks
        choiceBtns.forEach(b => b.disabled = true);

        if (selectedChoiceText === currentQ.answer) {
            btn.classList.add("correct");
            feedbackMessage.textContent = "Correct Answer!";
            feedbackMessage.style.color = "var(--success-color)";
            currentScore += 1;
            currentScoreElem.textContent = currentScore;
        } else {
            btn.classList.add("incorrect");
            // Highlight the correct button for user revelation
            choiceBtns.forEach(b => {
                if (b.querySelector("span").textContent === currentQ.answer) {
                    b.classList.add("correct");
                }
            });
            feedbackMessage.textContent = `Incorrect! The correct answer is: ${currentQ.answer}`;
            feedbackMessage.style.color = "var(--error-color)";
        }

        feedbackContainer.classList.remove("hidden");
        updateUserScoreInStorage();
    });
});

nextBtn.addEventListener("click", () => {
    currentQuestionIndex++;
    loadQuestion();
});

function updateUserScoreInStorage() {
    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    let userObj = users.find(u => u.username === currentUser);
    if (userObj) {
        if (currentScore > userObj.score) {
            userObj.score = currentScore;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
    }
}

function endGame() {
    questionText.innerHTML = `🎉 <strong>Congratulations, ${currentUser}!</strong> You have completed all 100 questions!<br>Final Score: <strong>${currentScore} / 100</strong>`;
    document.querySelector(".choices-grid").style.display = "none";
    feedbackContainer.style.display = "none";
    
    // Bring back main navigation for leaderboard inspection
    setTimeout(() => {
        document.getElementById("navbar").style.display = "flex";
        renderLeaderboard();
        switchTab("leaderboard-tab");
    }, 2500);
}

// Leaderboard Sorting & Rendering
function renderLeaderboard() {
    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    // Sort users descending by score
    users.sort((a, b) => b.score - a.score);

    leaderboardBody.innerHTML = "";

    if(users.length === 0) {
        leaderboardBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No players registered yet.</td></tr>`;
        return;
    }

    users.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#${index + 1}</td>
            <td>${escapeHtml(user.username)}</td>
            <td><strong>${user.score}</strong></td>
        `;
        leaderboardBody.appendChild(row);
    });
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
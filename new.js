// Game variables
var rows = 5;
var columns = 5;
var currTile;
var otherTile;
var turns = 0;
var timer;
var seconds = 0;
var gameStarted = false;
var blankPositions = [];
var currentPlayer = "";
// Initialize game when the page loads
window.onload = function () {
    document.getElementById("start-game-btn").addEventListener("click", startGameWithName);
    document.getElementById("start-btn").addEventListener("click", startGame);
    document.getElementById("reset-btn").addEventListener("click", resetGame);
    initializeBoard();
    loadHighScores();
};
// Start game after entering name
function startGameWithName() {
    currentPlayer = document.getElementById("player-name").value.trim();
    if (!currentPlayer) {
        alert("Please enter your name!");
        return;
    }
    document.getElementById("welcome-screen").classList.add("hidden");
    document.getElementById("game-container").classList.remove("hidden");
    document.getElementById("current-player").textContent = currentPlayer;
    startGame();
}
// Initialize the puzzle board
function initializeBoard() {
    document.getElementById("board").innerHTML = "";
    blankPositions = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.src = "./images/blank.jpg";
            tile.id = `tile-${r}-${c}`;
            if (r === rows - 1 && c === columns - 1) {
                blankPositions.push({ row: r, col: c });
            }
            addDragEvents(tile);
            document.getElementById("board").append(tile);
        }
    }
}
// Start the game
function startGame() {
    if (!currentPlayer || currentPlayer.trim() === "") {
        alert("You must enter your name to play the game.");
        return;
    }
    if (gameStarted) return;
    gameStarted = true;
    turns = 0;
    seconds = 0;
    document.getElementById("turns").innerText = turns;
    updateTimer();
    document.getElementById("start-btn").classList.add("hidden");
    document.getElementById("reset-btn").classList.remove("hidden");
    document.getElementById("pieces").classList.remove("hidden");
    timer = setInterval(() => {
        seconds++;
        updateTimer();
    }, 1000);
    createPuzzlePieces();
}
// Reset game state
function resetGame() {
    clearInterval(timer);
    gameStarted = false;
    document.getElementById("pieces").innerHTML = "";
    initializeBoard();
}
// Create puzzle pieces
function createPuzzlePieces() {
    document.getElementById("pieces").innerHTML = "";
    let pieces = [];
    for (let i = 1; i <= rows * columns - 1; i++) {
        pieces.push(i.toString());
    }
    shufeArray(pieces);
    for (let i = 0; i < pieces.length; i++) {
        let tile = document.createElement("img");
        tile.src = "./images/" + pieces[i] + ".jpg";
        addDragEvents(tile);
        document.getElementById("pieces").append(tile);
    }
}
// Shufe puzzle pieces
function shufeArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.foor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
// Add drag events to tile
function addDragEvents(tile) {
    tile.addEventListener("dragstart", dragStart);
    tile.addEventListener("dragover", dragOver);
    tile.addEventListener("dragenter", dragEnter);
    tile.addEventListener("dragleave", dragLeave);
    tile.addEventListener("drop", dragDrop);
    tile.addEventListener("dragend", dragEnd);
}
// Timer display update
function updateTimer() {
    const minutes = Math.foor(seconds / 60);
    const remainingSeconds = seconds % 60;
    document.getElementById("timer").innerText =
        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
// Drag-and-drop logic
function dragStart() {
    if (!gameStarted) return;
    currTile = this;
}
function dragOver(e) {
    if (!gameStarted) return;
    e.preventDefault();
}
function dragEnter(e) {
    if (!gameStarted) return;
    e.preventDefault();
}
function dragLeave() {
    if (!gameStarted) return;
}
function dragDrop() {
    if (!gameStarted) return;
    otherTile = this;
}
function dragEnd() {
    if (!gameStarted || !currTile || !otherTile || currTile.src.includes("blank")) {
        return;
    }
    let currImg = currTile.src;
    let otherImg = otherTile.src;
    currTile.src = otherImg;
    otherTile.src = currImg;
    turns++;
    document.getElementById("turns").innerText = turns;
    checkPuzzleSolved();
}
// Check if puzzle is solved
function checkPuzzleSolved() {
    let solved = true;
    let pieceCount = 1;
    outerLoop:
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            const tile = document.getElementById(`tile-${r}-${c}`);
            if (r === rows - 1 && c === columns - 1) {
                if (!tile.src.includes("blank")) {
                    solved = false;
                    break outerLoop;
                }
            } else {
                if (!tile.src.includes(pieceCount + ".jpg")) {
                    solved = false;
                    break outerLoop;
                }
                pieceCount++;
            }
        }
    }
    if (solved) {
        clearInterval(timer);
        setTimeout(() => {
            alert(` Congratulations ${currentPlayer}! You solved the puzzle in ${turns} turns and ${formatTime(seconds)}!`);
            saveHighScore(turns, seconds);
        }, 100);
    }

    // Format time nicely
    function formatTime(totalSeconds) {
        const minutes = Math.foor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    }
    // Save score to localStorage
    function saveHighScore(turns, time) {
        const scores = JSON.parse(localStorage.getItem("puzzleHighScores")) || [];
        scores.push({
            name: currentPlayer,
            turns: turns,
            time: time,
            date: new Date().toLocaleDateString()
        });
        scores.sort((a, b) => {
            if (a.time === b.time) return a.turns - b.turns;
            return a.time - b.time;
        });
        if (scores.length > 10) scores.length = 10;
        localStorage.setItem("puzzleHighScores", JSON.stringify(scores));
        loadHighScores();
    }
    // Load and display scores
    function loadHighScores() {
        const scores = JSON.parse(localStorage.getItem("puzzleHighScores")) || [];
        const scoresList = document.getElementById("scores-list");
        scoresList.innerHTML = "";
        if (scores.length === 0) {
            scoresList.innerHTML = "<li>No scores yet</li>";
            return;
        }
        scores.forEach((score, index) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${index + 1}. ${score.name}</strong> - ${score.turns} turns, ${formatTime(score.time)} - ${score.date}`;
            if (score.name === currentPlayer) {
                li.style.fontWeight = "bold";
                li.style.color = "#4b2e83";
            }
            scoresList.appendChild(li);
        });
    }
}
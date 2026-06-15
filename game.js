console.log("game.js loaded!");

// ===== GAME PARAMETERS =====
const INITIAL_TIMER = 150; // Timer value (100 steps * 100ms = 10s)
const TIMER_INTERVAL_MS = 100; // Timer tick interval in ms
const NUM_CONSONANTS = 7; // Number of consonants in the letter pool
const NUM_VOWELS = 4; // Number of vowels in the letter pool
const LETTER_WEIGHT_BASE = 12; // Higher value = more common low-score letters
const TIMER_BAR_PRECISION = 1; // Decimal places for time left display
const INVALID_WORD_FLASH_MS = 300; // Duration to show INVALID WORD
const INPUT_RESET_DELAY_MS = 500; // Delay before input display resets after enter
const MIN_WORD_LENGTH = 3; // Minimum valid word length
const MULTI_ADD = 0.5; // How much the score multiplier grows
// ============================

const dictionary = new Set();

function flashInvalidWord() {
  const textField = document.getElementById("input-display");
  textField.textContent = "INVALID WORD";
  textField.classList.add("invalid-word"); // Add the pink fade class

  setTimeout(() => {
    textField.textContent = "";
    textField.classList.remove("invalid-word"); // Remove pink bg/fade
  }, INVALID_WORD_FLASH_MS);
}

// Load dictionary from file
async function loadDictionary() {
  try {
    const response = await fetch("dictionary.txt");
    const text = await response.text();
    const words = text.split("\n").map((word) => word.trim());
    words.forEach((word) => dictionary.add(word.toUpperCase()));
  } catch (error) {
    console.error("Error loading dictionary:", error);
  }
}

// Validate word correctness
function isValidWord(word) {
  if (word.length < MIN_WORD_LENGTH) return false;
  return dictionary.has(word.toUpperCase());
}

function calculateScrabbleScore(word) {
  return Math.round(
    word
      .split("")
      .reduce(
        (score, letter) => score + letterScores[letter.toUpperCase()] || 0,
        0,
      ) * multiplier,
  );
}

let score = 0;
let multiplier = 1;

function updateScoreDisplay() {
  const scoreDisplay = document.getElementById("score-display");
  // Only update the score number; preserve the bonus span
  let scoreBonus = document.getElementById("score-bonus");
  if (scoreBonus && !scoreDisplay.querySelector("#score-bonus")) {
    scoreDisplay.appendChild(scoreBonus);
  }
  scoreDisplay.childNodes[0].textContent = "Score: " + score + " ";
}

function showScoreBonus(amount) {
  const bonusSpan = document.getElementById("score-bonus");
  bonusSpan.textContent = amount > 0 ? `+${amount}` : "";
  bonusSpan.classList.add("show");
  setTimeout(() => {
    bonusSpan.classList.remove("show");
  }, 900);
}

function updateMultiDisplay() {
  const multiDisplay = document.getElementById("multiplier-display");
  multiDisplay.textContent = "Multiplier: " + multiplier + "x";
}

const letterScores = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};

function buildWeightedArray(letters) {
  let arr = [];
  for (let letter of letters) {
    let weight = Math.max(LETTER_WEIGHT_BASE - letterScores[letter], 1); // higher score = lower freq
    for (let i = 0; i < weight; i++) {
      arr.push(letter);
    }
  }
  return arr;
}

function generateLetters() {
  const consonants = [
    "B",
    "C",
    "D",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "M",
    "N",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  const vowels = ["A", "E", "I", "O", "U"];

  const weightedConsonants = buildWeightedArray(consonants);
  const weightedVowels = buildWeightedArray(vowels);

  let selectedConsonants = [];
  let selectedVowels = [];

  // Weighted random select NUM_CONSONANTS consonants
  while (selectedConsonants.length < NUM_CONSONANTS) {
    const letter =
      weightedConsonants[Math.floor(Math.random() * weightedConsonants.length)];
    selectedConsonants.push(letter);
  }

  // Weighted random select NUM_VOWELS vowels
  while (selectedVowels.length < NUM_VOWELS) {
    const letter =
      weightedVowels[Math.floor(Math.random() * weightedVowels.length)];
    selectedVowels.push(letter);
  }

  // Combine and display the letters
  const allLetters = selectedConsonants.concat(selectedVowels);
  displayLetters(allLetters);
}

function displayLetters(letters) {
  const vowelSet = new Set(["A", "E", "I", "O", "U"]);
  const consonantTilesContainer = document.getElementById("consonant-tiles");
  const vowelTilesContainer = document.getElementById("vowel-tiles");
  consonantTilesContainer.innerHTML = "";
  vowelTilesContainer.innerHTML = "";
  console.log("Displaying letters:", letters); // debug log

  letters.forEach((letter) => {
    const tile = document.createElement("div");
    tile.className = "letter-tile";
    tile.textContent = letter;
    tile.dataset.letter = letter;
    if (vowelSet.has(letter.toUpperCase())) {
      vowelTilesContainer.appendChild(tile);
    } else {
      consonantTilesContainer.appendChild(tile);
    }
  });
}

function generateRandomLetter(type) {
  const consonants = [
    "B",
    "C",
    "D",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "M",
    "N",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  const vowels = ["A", "E", "I", "O", "U"];
  const weightedConsonants = buildWeightedArray(consonants);
  const weightedVowels = buildWeightedArray(vowels);
  if (type === "vowel") {
    const letter =
      weightedVowels[Math.floor(Math.random() * weightedVowels.length)];
    return letter;
  } else if (type === "consonant") {
    const letter =
      weightedConsonants[Math.floor(Math.random() * weightedConsonants.length)];
    return letter;
  } else {
    const allLetters = weightedConsonants.concat(weightedVowels);
    const letter = allLetters[Math.floor(Math.random() * allLetters.length)];
    return letter;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadDictionary();
  generateLetters();

  console.log("Dictionary loaded:", dictionary);
  const inputDisplay = document.getElementById("input-display");
  const timerBar = document.getElementById("timer-bar");
  const timerTime = document.getElementById("timer-time");
  let currentInput = "";
  let letterUsageCount = {}; // Object to track usage of letters
  let gameOver = false;
  let timer = INITIAL_TIMER; // now in 100ms steps, so 100*100ms = 10s
  let timerInterval = null;

  let correctWords = 0;
  let currentInitialTimer = INITIAL_TIMER;

  // --- Restart Button ---
  const restartBtn = document.getElementById("restart-btn");
  restartBtn.addEventListener("click", restartGame);

  // Allow Tab to focus restart when visible; and Enter/Space
  restartBtn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      restartGame();
    }
  });

  function showRestartButton() {
    restartBtn.style.visibility = "visible";
    restartBtn.disabled = false;
    restartBtn.focus();
  }

  function hideRestartButton() {
    restartBtn.style.visibility = "hidden";
    restartBtn.disabled = true;
  }

  function restartGame() {
    // Reset everything
    score = 0;
    multiplier = 1;
    correctWords = 0;
    currentInitialTimer = INITIAL_TIMER;
    currentInput = "";
    letterUsageCount = {};
    inputDisplay.textContent = "";
    updateScoreDisplay();
    updateMultiDisplay();
    generateLetters();
    hideRestartButton();
    gameOver = false;
    startTimer();
  }

  // --- end Button ---

  function startTimer() {
    timer = currentInitialTimer;
    updateTimerBar();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timer -= 1;
      updateTimerBar();
      if (timer <= 0) {
        clearInterval(timerInterval);
        handleGameOver();
      }
    }, TIMER_INTERVAL_MS);
  }

  function handleGameOver() {
    gameOver = true;
    inputDisplay.textContent = "GAME OVER";
    updateTimerBar();
    showRestartButton();
  }

  function updateTimerBar() {
    if (timerBar) {
      const percent =
        Math.max(0, Math.min(1, timer / currentInitialTimer)) * 100;
      timerBar.style.width = percent + "%";
    }
    if (timerTime) {
      const seconds = (timer / (1000 / TIMER_INTERVAL_MS)).toFixed(
        TIMER_BAR_PRECISION,
      );
      timerTime.textContent = seconds + "s";
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  function handleKeyDown(event) {
    if (gameOver) {
      // Make sure Tab goes to the restart button
      const isTab = event.key === "Tab";
      if (isTab) {
        restartGame();
        event.preventDefault();
      }
      return;
    }
    if (event.key === "Enter") {
      processInput();
    } else if (event.key === "Backspace" || event.key === "Delete") {
      handleBackspaceOrDelete();
    } else if (/^[a-zA-Z]$/.test(event.key)) {
      handleLetterInput(event.key.toUpperCase());
    }
    inputDisplay.textContent = currentInput;
  }

  function processInput() {
    console.log("Current input:", currentInput);
    if (dictionary.size === 0) {
      console.error(
        "Dictionary is empty. Check if the file was loaded correctly.",
      );
    }
    if (isValidWord(currentInput)) {
      processValidWord();
      startTimer();
    } else {
      flashInvalidWord(); // Call the function to flash "INVALID WORD"
      // --- Clear input, un-grey tiles, reset letter usage ---
      currentInput = ""; // Clear input
      inputDisplay.textContent = ""; // Clear display
      // Un-grey all tiles
      const allTiles = document.querySelectorAll(".letter-tile");
      allTiles.forEach((tile) => {
        tile.classList.remove("used-tile");
      });
      letterUsageCount = {}; // Reset for next input
      console.log(`"${currentInput}" is not a valid word.`);
    }
  }

  function processValidWord() {
    correctWords += 1;
    if (correctWords % 5 === 0) {
      currentInitialTimer = Math.floor(currentInitialTimer * 0.85);
      multiplier += MULTI_ADD;
      updateMultiDisplay();
      // Ensures the timer doesn't drop below 1
      if (currentInitialTimer < 1) currentInitialTimer = 1;
    }
    const wordScore = calculateScrabbleScore(currentInput);
    showScoreBonus(wordScore);
    score += wordScore;
    updateScoreDisplay();
    console.log(`"${currentInput}" is a valid word.`);
    console.log(
      "Current valid letters:",
      Array.from(document.querySelectorAll(".letter-tile")).map(
        (tile) => tile.textContent,
      ),
    );
    // Remove all greyed tiles
    const allTiles = document.querySelectorAll(".letter-tile");
    allTiles.forEach((tile) => {
      tile.classList.remove("used-tile"); // Un-grey all tiles
    });
    // Reset letter usage count for next word
    letterUsageCount = {};
    // Replace only the tiles used in the last word
    const usedLetters = currentInput.split(""); // Get the letters used in the last word
    updateLetterTiles(usedLetters);
    currentInput = ""; // Reset current input after processing
  }

  function updateLetterTiles(usedLetters) {
    const vowels = ["A", "E", "I", "O", "U"];
    usedLetters.forEach((letter) => {
      const tileToReplace = document.querySelector(
        `.letter-tile[data-letter="${letter}"]`,
      );
      if (tileToReplace) {
        // Check if the used letter is a vowel or consonant
        const isVowel = vowels.includes(letter.toUpperCase());
        const letterType = isVowel ? "vowel" : "consonant";
        const newLetter = generateRandomLetter(letterType); // Generate based on type
        tileToReplace.textContent = newLetter; // Replace the tile's letter
        tileToReplace.dataset.letter = newLetter; // Update the data attribute
      }
    });
  }

  function handleBackspaceOrDelete() {
    const deletedLetter = currentInput.slice(-1); // Get the last character
    currentInput = currentInput.slice(0, -1); // Remove the last character
    if (deletedLetter) {
      letterUsageCount[deletedLetter] = Math.max(
        (letterUsageCount[deletedLetter] || 0) - 1,
        0,
      ); // Decrement usage count
      // Un-grey the corresponding tile
      const tilesToUnGrey = document.querySelectorAll(
        `.letter-tile[data-letter="${deletedLetter}"]`,
      );
      const usedCount = letterUsageCount[deletedLetter] || 0;
      if (tilesToUnGrey[usedCount]) {
        tilesToUnGrey[usedCount].classList.remove("used-tile"); // Un-grey the tile
      }
    }
  }

  function handleLetterInput(typedLetter) {
    const letterTiles = Array.from(
      document.querySelectorAll(".letter-tile"),
    ).map((tile) => tile.textContent);
    const letterCount = letterTiles.filter(
      (letter) => letter === typedLetter,
    ).length;
    if ((letterUsageCount[typedLetter] || 0) < letterCount) {
      currentInput += typedLetter;
      // Grey out the specific tile
      const tilesToRemove = document.querySelectorAll(
        `.letter-tile[data-letter="${typedLetter}"]`,
      );
      const usedCount = letterUsageCount[typedLetter] || 0;
      if (tilesToRemove[usedCount]) {
        tilesToRemove[usedCount].classList.add("used-tile"); // Grey out the tile
        // Track usage of the letter
        letterUsageCount[typedLetter] =
          (letterUsageCount[typedLetter] || 0) + 1;
      }
    }
  }

  // Hide restart button initially
  hideRestartButton();
  // Start timer at the end of DOMContentLoaded block
  startTimer();
});

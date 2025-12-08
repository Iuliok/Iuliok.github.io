document.addEventListener("DOMContentLoaded", () => {


  const form = document.getElementById("contactForm");
  const output = document.getElementById("formOutput");
  const avg = document.getElementById("averageResult");
  const popup = document.getElementById("successPopup");
  const closeBtn = document.getElementById("closePopup");
  const submitBtn = document.getElementById("submitBtn");

  const vardas = form.vardas;
  const pavarde = form.pavarde;
  const email = form.email;
  const adresas = form.adresas;
  const phoneInput = form.telefonas;

  const nameRegex = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž ]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+370 6\d{2} \d{5}$/;

  function validateField(input, condition, message) {
    const error = input.nextElementSibling;

    if (!condition) {
      input.classList.add("is-invalid");
      error.textContent = message;
      error.style.display = "block";
      return false;
    } else {
      input.classList.remove("is-invalid");
      error.textContent = "";
      error.style.display = "none";
      return true;
    }
  }

  function checkFormValidity() {
    const valid =
      validateField(vardas, vardas.value.trim() !== "" && nameRegex.test(vardas.value), "Vardas turi būti sudarytas tik iš raidžių") &&
      validateField(pavarde, pavarde.value.trim() !== "" && nameRegex.test(pavarde.value), "Pavardė turi būti sudaryta tik iš raidžių") &&
      validateField(email, email.value.trim() !== "" && emailRegex.test(email.value), "Neteisingas el. pašto formatas") &&
      validateField(adresas, adresas.value.trim() !== "", "Adresas negali būti tuščias") &&
      phoneRegex.test(phoneInput.value);

    submitBtn.disabled = !valid;
  }

  vardas.addEventListener("input", () => {
    vardas.value = vardas.value.replace(/[^A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž ]/g, "");
    checkFormValidity();
  });

  pavarde.addEventListener("input", () => {
    pavarde.value = pavarde.value.replace(/[^A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž ]/g, "");
    checkFormValidity();
  });

  email.addEventListener("input", checkFormValidity);
  adresas.addEventListener("input", checkFormValidity);

  phoneInput.addEventListener("input", () => {
    let digits = phoneInput.value.replace(/\D/g, "");

    if (digits.startsWith("370")) digits = digits.slice(3);
    digits = digits.slice(0, 8);

    let formatted = "+370";
    if (digits.length > 0) formatted += " " + digits.slice(0, 1);
    if (digits.length > 1) formatted += digits.slice(1, 3);
    if (digits.length > 3) formatted += " " + digits.slice(3);

    phoneInput.value = formatted;

    validateField(
      phoneInput,
      phoneRegex.test(formatted),
      "Telefono numeris turi būti formatu: +370 6xx xxxxx"
    );

    checkFormValidity();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      vardas: vardas.value,
      pavarde: pavarde.value,
      email: email.value,
      telefonas: phoneInput.value,
      adresas: adresas.value,
      dizainas: +form.dizainas.value,
      turinys: +form.turinys.value,
      patogumas: +form.patogumas.value
    };

        console.log("Formos duomenys:", data);


    output.innerHTML = `
      <div class="info-item">
        <p><strong>Vardas:</strong> ${data.vardas}</p>
        <p><strong>Pavardė:</strong> ${data.pavarde}</p>
        <p><strong>El. paštas:</strong> ${data.email}</p>
        <p><strong>Tel. numeris:</strong> ${data.telefonas}</p>
        <p><strong>Adresas:</strong> ${data.adresas}</p>
      </div>
    `;
    output.style.display = "block";

    const vidurkis = ((data.dizainas + data.turinys + data.patogumas) / 3).toFixed(1);
    avg.textContent = `${data.vardas} ${data.pavarde}: ${vidurkis}`;

    popup.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => popup.style.display = "none");

  checkFormValidity();


  const board = document.getElementById("gameBoard");
  const movesEl = document.getElementById("moves");
  const matchesEl = document.getElementById("matches");
  const winMsg = document.getElementById("winMessage");

  const startBtn = document.getElementById("startGame");
  const resetBtn = document.getElementById("resetGame");
  const difficultySelect = document.getElementById("difficulty");

  function updateBestScore() {
  const key = "best_" + difficultySelect.value;
  const best = Number(localStorage.getItem(key));
  document.getElementById("bestScore").textContent = best ? best : "–";
}

  const levels = {
  easy:   { pairs: 6,  className: "easy"   }, 
  hard:   { pairs: 12, className: "hard"   }  
};


  let cards = [];
  let first = null;
  let second = null;
  let lock = false;
  let moves = 0;
  let matches = 0;

  let time = 0;
  let timer = null;
  const timeEl = document.getElementById("time");


const symbols = [
  "🍎","🍌","🍇","🍓","🍒","🥝",
  "🍍","🍉","🥥","🍑","🍋","🍐"
];

  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  function startGame() {
    board.innerHTML = "";
    winMsg.style.display = "none";

    moves = 0;
    matches = 0;
    movesEl.textContent = 0;
    matchesEl.textContent = 0;

    const level = levels[difficultySelect.value];
    board.className = `game-board ${level.className}`;

    cards = shuffle(
      symbols.slice(0, level.pairs).flatMap(s => [s, s])
    );

    cards.forEach(symbol => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.symbol = symbol;
      card.addEventListener("click", () => flip(card));
      board.appendChild(card);
    });
  }

  function startTimer() {
  stopTimer(); 
  time = 0;
  timeEl.textContent = time;

  timer = setInterval(() => {
    time++;
    timeEl.textContent = time;
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

  function flip(card) {
  if (lock || card.classList.contains("flipped")) return;

  card.textContent = card.dataset.symbol;
  card.classList.add("flipped");

  if (!first) {
    first = card;
    return;
  }

  second = card;
  lock = true;
  moves++;
  movesEl.textContent = moves;

  if (first.dataset.symbol === second.dataset.symbol) {
    matches++;
    matchesEl.textContent = matches;
    resetPick();

    if (matches === cards.length / 2) {
      winMsg.style.display = "block";
      stopTimer();

      const key = "best_" + difficultySelect.value;
      const best = Number(localStorage.getItem(key));

      if (!best || moves < best) {
        localStorage.setItem(key, moves);
        updateBestScore();
      }
    }

  } else {
    setTimeout(() => {
      first.textContent = "";
      second.textContent = "";
      first.classList.remove("flipped");
      second.classList.remove("flipped");
      resetPick();
    }, 800);
  }
}

  

  function resetPick() {
    [first, second, lock] = [null, null, false];
  }

startBtn.addEventListener("click", () => {
  startGame();
  startTimer();
  updateBestScore();
});

  resetBtn.addEventListener("click", startGame);
  difficultySelect.addEventListener("change", () => {
    startGame();
    updateBestScore();
  });
document.addEventListener("DOMContentLoaded", updateBestScore);


});


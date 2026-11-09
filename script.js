// Configuração das Cartas do Anime Bleach (6 pares = 12 cartas)
const CARDS_DATA = [
  {
    id: 'substitute-badge',
    title: 'Shinigami',
    color: '#ff6600',
    svg: `<svg viewBox="0 0 100 100" class="card-svg" style="color: #ff6600;">
      <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="none" stroke="currentColor" stroke-width="6"/>
      <circle cx="50" cy="40" r="14" fill="currentColor"/>
      <path d="M30 65 Q50 80 70 65" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'hollow-mask',
    title: 'Hollow Mask',
    color: '#00e5ff',
    svg: `<svg viewBox="0 0 100 100" class="card-svg" style="color: #00e5ff;">
      <path d="M25 20 Q50 5 75 20 Q85 50 75 80 Q50 95 25 80 Q15 50 25 20 Z" fill="none" stroke="currentColor" stroke-width="5"/>
      <ellipse cx="38" cy="42" rx="7" ry="11" fill="currentColor"/>
      <ellipse cx="62" cy="42" rx="7" ry="11" fill="currentColor"/>
      <path d="M35 25 L45 35 M30 38 L45 44 M28 52 L42 54" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
      <path d="M35 70 Q50 62 65 70" fill="none" stroke="currentColor" stroke-width="4"/>
      <path d="M40 67 V74 M50 65 V75 M60 67 V74" stroke="currentColor" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'zangetsu',
    title: 'Zangetsu',
    color: '#ff0055',
    svg: `<svg viewBox="0 0 100 100" class="card-svg" style="color: #ff0055;">
      <path d="M20 85 L75 20 C82 12 88 15 85 22 L55 70 L20 85 Z" fill="currentColor"/>
      <path d="M15 90 L25 80" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
      <path d="M40 30 Q65 40 80 65" fill="none" stroke="#fff" stroke-width="3" opacity="0.6"/>
    </svg>`
  },
  {
    id: 'gotei-13',
    title: 'Gotei 13',
    color: '#9d4edd',
    svg: `<svg viewBox="0 0 100 100" class="card-svg" style="color: #9d4edd;">
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="5"/>
      <polygon points="50,18 61,38 82,38 65,52 71,74 50,60 29,74 35,52 18,38 39,38" fill="none" stroke="currentColor" stroke-width="4"/>
      <circle cx="50" cy="50" r="8" fill="currentColor"/>
    </svg>`
  },
  {
    id: 'quincy-cross',
    title: 'Quincy',
    color: '#00b4d8',
    svg: `<svg viewBox="0 0 100 100" class="card-svg" style="color: #00b4d8;">
      <path d="M50 5 L55 45 L95 50 L55 55 L50 95 L45 55 L5 50 L45 45 Z" fill="currentColor"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'urahara-hat',
    title: 'Urahara',
    color: '#00ff88',
    svg: `<svg viewBox="0 0 100 100" class="card-svg" style="color: #00ff88;">
      <path d="M10 75 Q50 65 90 75 L80 40 Q50 35 20 40 Z" fill="none" stroke="currentColor" stroke-width="5"/>
      <path d="M30 40 L35 70 M50 37 L50 68 M70 40 L65 70" stroke="currentColor" stroke-width="4"/>
      <path d="M25 78 Q50 88 75 78" stroke="currentColor" stroke-width="5" fill="none"/>
    </svg>`
  }
];

// Estado do Jogo
let cardsDeck = [];
let flippedCards = [];
let matchedPairs = 0;
let movesCount = 0;
let timerSeconds = 0;
let timerInterval = null;
let gameStarted = false;
let isLockBoard = false;
let soundEnabled = true;

// Web Audio API para Sintetizador de Som Nativo
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (!soundEnabled || !audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === 'flip') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'match') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (type === 'unflip') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (type === 'win') {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.type = 'square';
      o.frequency.setValueAtTime(freq, now + idx * 0.12);
      g.gain.setValueAtTime(0.15, now + idx * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25);
      o.start(now + idx * 0.12);
      o.stop(now + idx * 0.12 + 0.25);
    });
  }
}

// Elementos DOM
const gridElement = document.getElementById('memory-grid');
const movesElement = document.getElementById('moves');
const timerElement = document.getElementById('timer');
const pairsElement = document.getElementById('pairs');
const restartBtn = document.getElementById('restart-btn');
const soundBtn = document.getElementById('sound-btn');
const soundIcon = document.getElementById('sound-icon');
const winModal = document.getElementById('win-modal');
const finalTimeElement = document.getElementById('final-time');
const finalMovesElement = document.getElementById('final-moves');
const finalRankElement = document.getElementById('final-rank');
const modalRestartBtn = document.getElementById('modal-restart-btn');

// Algoritmo Fisher-Yates para embaralhamento
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Formatar Tempo (MM:SS)
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Controle do Cronômetro
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerSeconds = 0;
  timerElement.textContent = '00:00';
  timerInterval = setInterval(() => {
    timerSeconds++;
    timerElement.textContent = formatTime(timerSeconds);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Inicializar Tabuleiro
function initGame() {
  stopTimer();
  gameStarted = false;
  isLockBoard = false;
  flippedCards = [];
  matchedPairs = 0;
  movesCount = 0;
  timerSeconds = 0;

  movesElement.textContent = '0';
  timerElement.textContent = '00:00';
  pairsElement.textContent = '0 / 6';
  winModal.classList.add('hidden');

  // Duplicar os 6 pares para totalizar 12 cartas
  const deckData = [...CARDS_DATA, ...CARDS_DATA];
  cardsDeck = shuffleArray(deckData);

  gridElement.innerHTML = '';

  cardsDeck.forEach((cardItem, index) => {
    const cardEl = document.createElement('div');
    cardEl.classList.add('card');
    cardEl.dataset.id = cardItem.id;
    cardEl.dataset.index = index;

    cardEl.innerHTML = `
      <div class="card-face card-back">
        <div class="card-back-design">
          <span class="card-back-icon">☠</span>
        </div>
      </div>
      <div class="card-face card-front">
        ${cardItem.svg}
        <span class="card-title" style="color: ${cardItem.color}">${cardItem.title}</span>
      </div>
    `;

    cardEl.addEventListener('click', () => handleCardClick(cardEl));
    gridElement.appendChild(cardEl);
  });
}

// Manipulação do Clique na Carta
function handleCardClick(cardEl) {
  if (isLockBoard) return;
  if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

  // Iniciar Cronômetro no primeiro clique
  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }

  // Revelar a carta
  cardEl.classList.add('flipped');
  playSound('flip');
  flippedCards.push(cardEl);

  // Quando 2 cartas forem reveladas
  if (flippedCards.length === 2) {
    movesCount++;
    movesElement.textContent = movesCount;
    checkMatch();
  }
}

// Verificação de Par
function checkMatch() {
  isLockBoard = true;
  const [card1, card2] = flippedCards;
  const isMatch = card1.dataset.id === card2.dataset.id;

  if (isMatch) {
    setTimeout(() => {
      card1.classList.add('matched');
      card2.classList.add('matched');
      playSound('match');
      matchedPairs++;
      pairsElement.textContent = `${matchedPairs} / 6`;
      flippedCards = [];
      isLockBoard = false;

      // Verificar Vitória
      if (matchedPairs === 6) {
        handleWin();
      }
    }, 400);
  } else {
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      playSound('unflip');
      flippedCards = [];
      isLockBoard = false;
    }, 900);
  }
}

// Determinar Rank Shinigami
function getRank(moves, time) {
  if (moves <= 8 && time <= 25) return 'Capitão Comandante (Yamamoto)';
  if (moves <= 11 && time <= 45) return 'Capitão do Gotei 13';
  if (moves <= 15) return 'Tenente de Esquadrão';
  return 'Shinigami Substituto';
}

// Tratar Fim de Jogo (Vitória)
function handleWin() {
  stopTimer();
  playSound('win');

  finalTimeElement.textContent = formatTime(timerSeconds);
  finalMovesElement.textContent = movesCount;
  finalRankElement.textContent = getRank(movesCount, timerSeconds);

  setTimeout(() => {
    winModal.classList.remove('hidden');
  }, 600);
}

// Event Listeners dos Botões
restartBtn.addEventListener('click', () => {
  playSound('flip');
  initGame();
});

modalRestartBtn.addEventListener('click', () => {
  playSound('flip');
  initGame();
});

soundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
  soundBtn.childNodes[1].textContent = soundEnabled ? ' SOM: ON' : ' SOM: OFF';
});

// Inicializar na carga da página
document.addEventListener('DOMContentLoaded', initGame);
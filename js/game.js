function getApiUrl() {
  if (window.location.port === "5000" || window.location.port === "5500") {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }
  return window.location.origin;
}

const API = getApiUrl();
const player = JSON.parse(localStorage.getItem("wmPlayer") || "null");
if (!player) {
  location.href = "index.html";
}

const trackNames = {
  itGeneral: "🔮 Đa Vũ Trụ CNTT",
  gameDev: "🎮 Chuyên Ngành Game",
  aiFuture: "🤖 Chuyên Ngành AI & Data",
  webDev: "🌐 Chuyên Ngành Web & Cloud"
};

const currentTrack = player.track || "itGeneral";

// Set Header Info
const nameEl = document.getElementById("playerNameDisplay");
const trackBadgeEl = document.getElementById("trackBadge");
if (nameEl) nameEl.textContent = player.name || "Khám phá viên";
if (trackBadgeEl) trackBadgeEl.textContent = trackNames[currentTrack] || "CHUYÊN NGÀNH";

let questions = [];
let current = 0;
let scores = {};

async function init() {
  try {
    const r = await fetch(`${API}/questions?track=${encodeURIComponent(currentTrack)}`);
    if (r.ok) {
      questions = await r.json();
    } else {
      throw new Error("Cannot fetch /questions");
    }
  } catch (e) {
    try {
      // Fallback to static db.json (useful for static cloud hosting like Render/GitHub Pages)
      const staticRes = await fetch("db.json");
      if (staticRes.ok) {
        const db = await staticRes.json();
        const allQuestions = db.questions || [];
        questions = allQuestions.filter(q => q.track === currentTrack);
        if (questions.length === 0) {
          questions = allQuestions.slice(0, 7);
        }
      }
    } catch (err2) {
      console.error("Failed to load questions:", err2);
      document.getElementById("question").textContent = "Không tải được câu hỏi. Vui lòng thử lại.";
      return;
    }
  }

  if (questions && questions.length > 0) {
    // Initialize scores map dynamically
    questions.forEach(q => {
      if (q.answers) {
        q.answers.forEach(a => {
          if (a.universe && scores[a.universe] === undefined) {
            scores[a.universe] = 0;
          }
        });
      }
    });
    render();
  } else {
    document.getElementById("question").textContent = "Chưa có câu hỏi cho chuyên ngành này.";
  }
}

function render() {
  const q = questions[current];
  if (!q) return;

  const counterEl = document.getElementById("counter");
  const barEl = document.getElementById("bar");
  const qEl = document.getElementById("question");
  const box = document.getElementById("answers");

  if (counterEl) counterEl.textContent = `${current + 1}/${questions.length}`;
  if (barEl) barEl.style.width = `${((current + 1) / questions.length) * 100}%`;
  if (qEl) {
    qEl.innerHTML = `<span class="q-num">Câu ${current + 1}:</span> ${escapeHtml(q.text)}`;
  }

  if (box) {
    box.innerHTML = "";
    q.answers.forEach((a, idx) => {
      const b = document.createElement("button");
      b.className = "answer";
      b.innerHTML = `
        <span class="answer-index">${String.fromCharCode(65 + idx)}</span>
        <span class="answer-text">${escapeHtml(a.text)}</span>
      `;
      b.onclick = () => choose(a.universe);
      box.appendChild(b);
    });
  }
}

async function choose(u) {
  if (scores[u] !== undefined) {
    scores[u] = (scores[u] || 0) + 1;
  }
  current++;
  if (current < questions.length) {
    render();
    return;
  }

  // Determine top universe
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = (sortedScores.length > 0 && sortedScores[0][1] > 0) ? sortedScores[0][0] : Object.keys(scores)[0];

  let result = {
    id: Date.now(),
    playerId: player ? player.id : Date.now(),
    playerName: player ? player.name : "Người chơi",
    track: currentTrack,
    scores: scores,
    primaryUniverse: primary,
    createdAt: new Date().toISOString()
  };

  try {
    const res = await fetch(`${API}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    });
    if (res.ok) {
      result = await res.json();
    }
  } catch (err) {
    console.warn("API POST /results offline, saved locally:", err);
  }

  localStorage.setItem("wmResult", JSON.stringify(result));
  location.href = "result.html";
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

init();
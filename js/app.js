function getApiUrl() {
  if (window.location.port === "5000" || window.location.port === "5500") {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }
  return window.location.origin;
}

const API = getApiUrl();

const trackInfo = {
  gameDev: {
    name: "Lập Trình Game",
    tagline: "Gameplay, 3D Art, Game Design, Engine, QA Tester",
    badge: "CHUYÊN NGÀNH GAME"
  },
  aiFuture: {
    name: "Lập Trình AI & Data",
    tagline: "GenAI, Machine Learning, Computer Vision, MLOps",
    badge: "CHUYÊN NGÀNH AI"
  },
  webDev: {
    name: "Lập Trình Web & Cloud",
    tagline: "Frontend, Backend API, Cloud, DevOps, UI/UX",
    badge: "CHUYÊN NGÀNH WEB"
  },
  itGeneral: {
    name: "Đa Vũ Trụ CNTT",
    tagline: "Khám phá tổng hợp: AI, Game, Web, CyberSec, Product",
    badge: "TỔNG HỢP CNTT"
  }
};

let activeTrack = "gameDev";

// Read track from URL parameter if available (?track=gameDev)
const urlParams = new URLSearchParams(window.location.search);
const paramTrack = urlParams.get("track");

async function loadActiveTrack() {
  if (paramTrack && trackInfo[paramTrack]) {
    activeTrack = paramTrack;
    renderActiveTrackBanner();
    return;
  }

  try {
    const res = await fetch(`${API}/config`);
    if (res.ok) {
      const cfg = await res.json();
      if (cfg.activeTrack && trackInfo[cfg.activeTrack]) {
        activeTrack = cfg.activeTrack;
      }
    }
  } catch (err) {
    console.warn("Could not fetch active track from API, using default:", err);
  }

  renderActiveTrackBanner();
}

function renderActiveTrackBanner() {
  const info = trackInfo[activeTrack] || trackInfo.gameDev;
  const titleEl = document.getElementById("bannerTitle");
  const descEl = document.getElementById("bannerDesc");

  if (titleEl) titleEl.textContent = info.name;
  if (descEl) descEl.textContent = info.tagline;
}

document.getElementById("joinForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("name");
  const name = nameInput ? nameInput.value.trim() : "";
  if (!name) return;

  const submitBtn = e.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang vào bài thi...";
  }

  let player = {
    id: Date.now(),
    name: name,
    track: activeTrack,
    joinedAt: new Date().toISOString()
  };

  try {
    const res = await fetch(`${API}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, track: activeTrack, joinedAt: player.joinedAt })
    });
    if (res.ok) {
      player = await res.json();
    }
  } catch (err) {
    console.warn("API offline or blocked, using local player session:", err);
  }

  localStorage.setItem("wmPlayer", JSON.stringify(player));
  location.href = "game.html";
});

// QR Share Modal
let shareQr = null;
function openShareQrModal() {
  const modal = document.getElementById("shareQrModal");
  const display = document.getElementById("shareUrlDisplay");
  const container = document.getElementById("shareQrCode");
  
  const currentUrl = `${window.location.origin}/index.html?track=${encodeURIComponent(activeTrack)}`;

  if (display) display.textContent = currentUrl;
  if (container && !shareQr && typeof QRCode !== "undefined") {
    container.innerHTML = "";
    shareQr = new QRCode(container, {
      text: currentUrl,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
  if (modal) modal.classList.add("active");
}

function closeShareQrModal(e) {
  const modal = document.getElementById("shareQrModal");
  if (modal) modal.classList.remove("active");
}

loadActiveTrack();
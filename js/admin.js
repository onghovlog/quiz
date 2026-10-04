function getApiUrl() {
  if (window.location.port === "5000" || window.location.port === "5500") {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }
  return window.location.origin;
}

const API = getApiUrl();

const trackInfo = {
  gameDev: { name: "Lập Trình Game", icon: "🎮", color: "#ff6b81" },
  aiFuture: { name: "Lập Trình AI & Data", icon: "🤖", color: "#00d2d3" },
  webDev: { name: "Lập Trình Web & Cloud", icon: "🌐", color: "#54a0ff" },
  itGeneral: { name: "Đa Vũ Trụ CNTT", icon: "🔮", color: "#b388ff" }
};

// Universe meta fallback
const defaultUniversesMeta = {
  itGeneral: {
    aiFuture: { name: "AI Engineer", icon: "🤖" },
    gameDev: { name: "Game Developer", icon: "🎮" },
    webDev: { name: "Web & Cloud Architect", icon: "🌐" },
    cyberSec: { name: "Cyber Security", icon: "🛡️" },
    product: { name: "Product & Tech Lead", icon: "🚀" },
    uiux: { name: "UI/UX Designer", icon: "🎨" }
  },
  gameDev: {
    gameplay: { name: "Gameplay Programmer", icon: "🕹️" },
    gameArtist: { name: "Game 3D Artist & VFX", icon: "🎨" },
    gameDesigner: { name: "Game & Level Designer", icon: "📜" },
    engineDev: { name: "Game Engine & Graphics", icon: "⚙️" },
    gameQA: { name: "Game Tester & QA", icon: "🎯" }
  },
  aiFuture: {
    llmPrompt: { name: "GenAI & Prompt Engineer", icon: "🧠" },
    mlEngineer: { name: "Machine Learning Engineer", icon: "🔬" },
    dataScientist: { name: "Data Scientist & Big Data", icon: "📊" },
    computerVision: { name: "Computer Vision & Robot", icon: "👁️" },
    mlOps: { name: "MLOps & Cloud AI", icon: "⚡" }
  },
  webDev: {
    frontend: { name: "Frontend Master", icon: "🎨" },
    backend: { name: "Backend & Systems", icon: "⚙️" },
    devops: { name: "DevOps & Cloud", icon: "☁️" },
    fullstack: { name: "Fullstack Ninja", icon: "⚡" },
    uiuxWeb: { name: "Web UX Specialist", icon: "👁️" }
  }
};

let currentActiveTrack = "gameDev";
let activeFilter = "all";
let universesMeta = defaultUniversesMeta;
let previewQr = null;
let modalQr = null;
let currentPlayerUrl = "";

function getPlayerUrl(customHost) {
  let baseOrigin = window.location.origin;
  if (customHost && customHost.trim()) {
    const host = customHost.trim();
    const port = window.location.port ? `:${window.location.port}` : "";
    baseOrigin = `${window.location.protocol}//${host}${port}`;
  }
  return `${baseOrigin}/index.html?track=${encodeURIComponent(currentActiveTrack)}`;
}

function renderQrCodes(url) {
  currentPlayerUrl = url;
  const urlDisplay = document.getElementById("playerUrlDisplay");
  const modalDisplay = document.getElementById("modalUrlDisplay");
  if (urlDisplay) urlDisplay.textContent = url;
  if (modalDisplay) modalDisplay.textContent = url;

  const previewEl = document.getElementById("qrCodePreview");
  if (previewEl && typeof QRCode !== "undefined") {
    previewEl.innerHTML = "";
    previewQr = new QRCode(previewEl, {
      text: url,
      width: 110,
      height: 110,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  const modalEl = document.getElementById("bigQrCode");
  if (modalEl && typeof QRCode !== "undefined") {
    modalEl.innerHTML = "";
    modalQr = new QRCode(modalEl, {
      text: url,
      width: 250,
      height: 250,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

function updateActiveTrackUI(trackKey) {
  currentActiveTrack = trackKey;
  const info = trackInfo[trackKey] || { name: trackKey, icon: "🎯" };
  const fullTitle = `${info.icon} ${info.name}`;

  // Update Buttons
  const buttons = document.querySelectorAll(".admin-track-btn");
  buttons.forEach(btn => {
    const t = btn.getAttribute("data-track");
    if (t === trackKey) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update displays
  const nameDisplay = document.getElementById("activeTrackNameDisplay");
  if (nameDisplay) nameDisplay.textContent = fullTitle;

  const qrNotice = document.getElementById("qrTrackNotice");
  if (qrNotice) qrNotice.textContent = fullTitle;

  const modalTrackBadge = document.getElementById("modalTrackBadge");
  if (modalTrackBadge) modalTrackBadge.textContent = `Chủ đề bài thi: ${fullTitle}`;

  // Re-generate QR
  const hostInput = document.getElementById("customHostInput");
  const host = hostInput ? hostInput.value : "";
  renderQrCodes(getPlayerUrl(host));
}

async function setActiveTrack(trackKey) {
  if (!trackKey) return;
  updateActiveTrackUI(trackKey);

  try {
    const res = await fetch(`${API}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeTrack: trackKey })
    });
    if (res.ok) {
      console.log("Updated active track on server to:", trackKey);
    }
  } catch (err) {
    console.warn("Could not save activeTrack to server:", err);
  }
}

async function fetchInitialConfig() {
  try {
    const res = await fetch(`${API}/config`);
    if (res.ok) {
      const config = await res.json();
      if (config.activeTrack) {
        currentActiveTrack = config.activeTrack;
      }
      if (config.universesMeta) {
        universesMeta = config.universesMeta;
      }
    }
  } catch (e) {
    console.warn("Using default active track");
  }
  updateActiveTrackUI(currentActiveTrack);
}

function initQr() {
  const hostInput = document.getElementById("customHostInput");
  if (hostInput) {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      hostInput.placeholder = "192.168.1.8 (IP WiFi)";
    }
    hostInput.addEventListener("change", (e) => {
      renderQrCodes(getPlayerUrl(e.target.value));
    });
    hostInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        renderQrCodes(getPlayerUrl(e.target.value));
      }
    });
  }
  renderQrCodes(getPlayerUrl());
}

function openQrModal() {
  const modal = document.getElementById("qrModal");
  if (modal) modal.classList.add("active");
}

function closeQrModal(e) {
  const modal = document.getElementById("qrModal");
  if (modal) modal.classList.remove("active");
}

function copyPlayerUrl() {
  if (!currentPlayerUrl) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(currentPlayerUrl).then(() => {
      alert("Đã sao chép link người chơi:\n" + currentPlayerUrl);
    }).catch(() => {
      prompt("Sao chép link người chơi:", currentPlayerUrl);
    });
  } else {
    prompt("Sao chép link người chơi:", currentPlayerUrl);
  }
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const sec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (isNaN(sec) || sec < 5) return "vừa xong";
  if (sec < 60) return `${sec} giây trước`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return new Date(dateString).toLocaleDateString("vi-VN");
}

function updateConnectionStatus(isOnline, serverHost) {
  const dot = document.getElementById("statusDot");
  const text = document.getElementById("statusText");
  if (!dot || !text) return;

  if (isOnline) {
    dot.className = "status-dot";
    text.textContent = `Máy chủ: Hoạt động (${serverHost || API})`;
  } else {
    dot.className = "status-dot offline";
    text.textContent = `Máy chủ: Chưa kết nối (${serverHost || API})`;
  }
}

function getUniverseInfo(uKey, trackKey) {
  if (trackKey && universesMeta[trackKey] && universesMeta[trackKey][uKey]) {
    return universesMeta[trackKey][uKey];
  }
  for (const t of Object.keys(universesMeta)) {
    if (universesMeta[t] && universesMeta[t][uKey]) {
      return universesMeta[t][uKey];
    }
  }
  return { name: uKey, icon: "✨" };
}

async function loadDashboard() {
  try {
    let results = [];
    let isConnected = false;

    try {
      const res = await fetch(`${API}/results`);
      if (res.ok) {
        results = await res.json();
        isConnected = true;
      } else {
        throw new Error("API /results returned " + res.status);
      }
    } catch (e) {
      // Fallback: Read static db.json
      try {
        const staticRes = await fetch("db.json");
        if (staticRes.ok) {
          const db = await staticRes.json();
          results = db.results || [];
          if (db.universesMeta) universesMeta = db.universesMeta;
          isConnected = true;
        }
      } catch (err2) {
        isConnected = false;
      }
    }

    updateConnectionStatus(isConnected, API);

    if (!Array.isArray(results)) results = [];

    // Filter results based on activeFilter
    const filteredResults = activeFilter === "all"
      ? results
      : results.filter(r => (r.track || "itGeneral") === activeFilter);

    // Update total count
    document.getElementById("total").textContent = filteredResults.length;

    // Calculate Top Track overall
    const trackCounts = {};
    results.forEach(r => {
      const t = r.track || "itGeneral";
      trackCounts[t] = (trackCounts[t] || 0) + 1;
    });
    const sortedTracks = Object.entries(trackCounts).sort((a, b) => b[1] - a[1]);
    const topTrackKey = sortedTracks.length > 0 ? sortedTracks[0][0] : null;
    const topTrackInfo = topTrackKey && trackInfo[topTrackKey] ? trackInfo[topTrackKey] : null;
    document.getElementById("topTrack").textContent = topTrackInfo
      ? `${topTrackInfo.icon} ${topTrackInfo.name}`
      : "—";

    // Track name badge on distribution panel
    const distBadge = document.getElementById("distributionTrackName");
    if (distBadge) {
      distBadge.textContent = activeFilter === "all"
        ? "TẤT CẢ CHUYÊN NGÀNH"
        : (trackInfo[activeFilter]?.name?.toUpperCase() || activeFilter.toUpperCase());
    }

    // Calculate universe counts for filtered set
    const count = {};
    filteredResults.forEach((r) => {
      const u = r.primaryUniverse;
      if (u) {
        count[u] = (count[u] || 0) + 1;
      }
    });

    // Find dominant universe
    const sortedUniverses = Object.entries(count).sort((a, b) => b[1] - a[1]);
    if (sortedUniverses.length > 0 && sortedUniverses[0][1] > 0) {
      const uKey = sortedUniverses[0][0];
      const uInfo = getUniverseInfo(uKey, activeFilter);
      document.getElementById("leader").textContent = `${uInfo.icon} ${uInfo.name}`;
    } else {
      document.getElementById("leader").textContent = "—";
    }

    // Render bars
    const barsContainer = document.getElementById("bars");
    if (sortedUniverses.length === 0) {
      barsContainer.innerHTML = `<p style="color:var(--muted);text-align:center;padding:20px 0;">Chưa có dữ liệu phân bố.</p>`;
    } else {
      barsContainer.innerHTML = sortedUniverses
        .map(([k, v]) => {
          const uInfo = getUniverseInfo(k, activeFilter);
          const pct = filteredResults.length ? Math.round((v / filteredResults.length) * 100) : 0;
          return `<div class="dash-row">
            <div class="dash-head">
              <span>${uInfo.icon} ${uInfo.name}</span>
              <b>${v} SV · ${pct}%</b>
            </div>
            <div class="dash-bar"><i style="width:${pct}%"></i></div>
          </div>`;
        })
        .join("");
    }

    // Render recent participant list
    const recentEl = document.getElementById("recent");
    if (filteredResults.length === 0) {
      recentEl.innerHTML = `
        <div style="text-align:center;padding:30px 10px;color:var(--muted)">
          <div style="font-size:32px;margin-bottom:8px">👥</div>
          <p style="margin:0">Chưa có người tham gia trong mục này.</p>
          <p style="font-size:12px;margin-top:6px">Hãy quét mã QR hoặc bấm <b>"Thêm dữ liệu mẫu"</b> để trải nghiệm.</p>
        </div>
      `;
    } else {
      recentEl.innerHTML = filteredResults
        .slice(0, 100)
        .map((r) => {
          const tKey = r.track || "itGeneral";
          const t = trackInfo[tKey] || { name: tKey, icon: "✨" };
          const uInfo = getUniverseInfo(r.primaryUniverse, tKey);
          const time = timeAgo(r.createdAt);
          return `
            <div class="person-row">
              <div class="person-avatar">${uInfo.icon || t.icon}</div>
              <div class="person-main">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <span class="person-name">${escapeHtml(r.playerName || "Sinh viên")}</span>
                  <span class="track-tag">${t.icon} ${t.name}</span>
                </div>
                <span class="person-time">${time}</span>
              </div>
              <div class="person-tag">${uInfo.icon} ${uInfo.name}</div>
            </div>
          `;
        })
        .join("");
    }
  } catch (e) {
    updateConnectionStatus(false, API);
    document.getElementById("recent").innerHTML = "<p style='color:var(--muted)'>Đang chờ kết nối dữ liệu...</p>";
  }
}

// Setup filter button listeners
const filterPills = document.querySelectorAll(".filter-pill");
filterPills.forEach(pill => {
  pill.addEventListener("click", () => {
    filterPills.forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    activeFilter = pill.getAttribute("data-filter") || "all";
    loadDashboard();
  });
});

async function seedDemoData() {
  try {
    const res = await fetch(`${API}/seed`, { method: "POST" });
    if (res.ok) {
      await loadDashboard();
      alert("Đã thêm 10 sinh viên mẫu đa dạng các chuyên ngành Game, AI, Web, Đa vũ trụ thành công!");
    } else {
      throw new Error("Không thể gọi API seed");
    }
  } catch (err) {
    alert("Không thể thêm dữ liệu mẫu qua API. Kiểm tra kết nối máy chủ.");
  }
}

async function resetAllData() {
  if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ kết quả để bắt đầu buổi chơi mới?")) return;
  try {
    const res = await fetch(`${API}/reset`, { method: "POST" });
    if (res.ok) {
      await loadDashboard();
      alert("Đã làm sạch toàn bộ dữ liệu kết quả!");
    } else {
      throw new Error("Không thể gọi API reset");
    }
  } catch (err) {
    alert("Không thể xóa dữ liệu qua API. Kiểm tra kết nối máy chủ.");
  }
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

fetchInitialConfig();
initQr();
loadDashboard();
setInterval(loadDashboard, 3000);
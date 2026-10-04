const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, "db.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return { tracks: [], universesMeta: {}, players: [], results: [], questions: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing db.json:", err);
    return false;
  }
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query || {};

  // --- HEALTH / STATUS ENDPOINT ---
  if (pathname === "/status" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "online", time: new Date().toISOString() }));
    return;
  }

  // --- TRACKS METADATA ENDPOINT ---
  if (pathname === "/tracks" && req.method === "GET") {
    const db = readDb();
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      tracks: db.tracks || [],
      universesMeta: db.universesMeta || {}
    }));
    return;
  }

  // --- QUESTIONS ENDPOINT (SUPPORT FILTER BY TRACK) ---
  if (pathname === "/questions" && req.method === "GET") {
    const db = readDb();
    let list = db.questions || [];
    const track = query.track;
    if (track && track !== "all") {
      const filtered = list.filter(q => q.track === track);
      if (filtered.length > 0) {
        list = filtered;
      }
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(list));
    return;
  }

  // --- PLAYERS ENDPOINT ---
  if (pathname === "/players") {
    const db = readDb();
    if (req.method === "GET") {
      let players = db.players || [];
      if (query.track && query.track !== "all") {
        players = players.filter(p => p.track === query.track);
      }
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(players));
      return;
    }
    if (req.method === "POST") {
      let body = "";
      req.on("data", chunk => (body += chunk));
      req.on("end", () => {
        try {
          const item = JSON.parse(body || "{}");
          item.id = (db.players && db.players.length > 0) ? Math.max(...db.players.map(p => p.id || 0)) + 1 : 1;
          if (!item.track) item.track = "itGeneral";
          if (!db.players) db.players = [];
          db.players.push(item);
          writeDb(db);
          res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify(item));
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }
  }

  // --- RESULTS ENDPOINT ---
  if (pathname === "/results") {
    const db = readDb();
    if (req.method === "GET") {
      let results = [...(db.results || [])];
      if (query.track && query.track !== "all") {
        results = results.filter(r => r.track === query.track);
      }
      // Sort desc by createdAt
      results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(results));
      return;
    }
    if (req.method === "POST") {
      let body = "";
      req.on("data", chunk => (body += chunk));
      req.on("end", () => {
        try {
          const item = JSON.parse(body || "{}");
          item.id = (db.results && db.results.length > 0) ? Math.max(...db.results.map(r => r.id || 0)) + 1 : 1;
          if (!item.track) item.track = "itGeneral";
          if (!db.results) db.results = [];
          db.results.push(item);
          writeDb(db);
          res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify(item));
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }
  }

  // --- RESET ALL DATA ---
  if (pathname === "/reset" && req.method === "POST") {
    const db = readDb();
    db.players = [];
    db.results = [];
    writeDb(db);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ success: true, message: "Cleared all players and results" }));
    return;
  }

  // --- SEED SAMPLE DEMO DATA ACROSS ALL TRACKS ---
  if (pathname === "/seed" && req.method === "POST") {
    const db = readDb();
    const demoSamples = [
      { name: "Minh Anh", track: "itGeneral", universe: "aiFuture", scores: { aiFuture: 4, gameDev: 1, webDev: 1, cyberSec: 1, product: 0, uiux: 0 } },
      { name: "Hoàng Long", track: "aiFuture", universe: "llmPrompt", scores: { llmPrompt: 5, mlEngineer: 1, dataScientist: 1, computerVision: 0, mlOps: 0 } },
      { name: "Quang Huy", track: "gameDev", universe: "gameplay", scores: { gameplay: 5, gameArtist: 1, gameDesigner: 1, engineDev: 0, gameQA: 0 } },
      { name: "Thu Hà", track: "gameDev", universe: "gameArtist", scores: { gameplay: 1, gameArtist: 4, gameDesigner: 1, engineDev: 1, gameQA: 0 } },
      { name: "Đức Thắng", track: "itGeneral", universe: "cyberSec", scores: { aiFuture: 1, gameDev: 0, webDev: 1, cyberSec: 5, product: 0, uiux: 0 } },
      { name: "Phương Linh", track: "webDev", universe: "frontend", scores: { frontend: 4, backend: 1, devops: 0, fullstack: 1, uiuxWeb: 1 } },
      { name: "Bảo Trâm", track: "aiFuture", universe: "computerVision", scores: { llmPrompt: 1, mlEngineer: 1, dataScientist: 0, computerVision: 4, mlOps: 1 } },
      { name: "Tuấn Kiệt", track: "gameDev", universe: "gameDesigner", scores: { gameplay: 1, gameArtist: 1, gameDesigner: 5, engineDev: 0, gameQA: 0 } },
      { name: "Hải Đăng", track: "webDev", universe: "backend", scores: { frontend: 1, backend: 5, devops: 1, fullstack: 0, uiuxWeb: 0 } },
      { name: "Thanh Hằng", track: "itGeneral", universe: "uiux", scores: { aiFuture: 0, gameDev: 1, webDev: 1, cyberSec: 0, product: 1, uiux: 4 } }
    ];

    if (!db.players) db.players = [];
    if (!db.results) db.results = [];

    demoSamples.forEach((s, idx) => {
      const pId = db.players.length + 1;
      const rId = db.results.length + 1;
      const now = new Date(Date.now() - idx * 25000).toISOString();
      db.players.push({ id: pId, name: s.name, track: s.track, joinedAt: now });
      db.results.push({ id: rId, playerId: pId, playerName: s.name, track: s.track, scores: s.scores, primaryUniverse: s.universe, createdAt: now });
    });

    writeDb(db);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ success: true, count: demoSamples.length }));
    return;
  }

  // --- STATIC FILE SERVING ---
  let filePath = pathname === "/" ? "/index.html" : pathname;
  filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, "");
  const fullPath = path.join(__dirname, filePath);

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<h1>404 Not Found</h1><p>File not found: ${pathname}</p>`);
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(fullPath).pipe(res);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`====================================================`);
  console.log(`  Tech & Game & AI Multiverse Server is RUNNING on PORT ${PORT}!`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Admin:   http://localhost:${PORT}/admin.html`);
  console.log(`====================================================`);
});

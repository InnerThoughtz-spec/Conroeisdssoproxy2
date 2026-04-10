/**
 * Scramjet Proxy — Production Server
 * Deploy to Railway, Render, Fly.io, or any Node host.
 */

const express  = require("express");
const path     = require("path");
const { createServer } = require("http");

// ── Bare server (Scramjet relay) ────────────────────────────
let createBareServer;
try {
  ({ createBareServer } = require("@mercuryworkshop/bare-server-node"));
} catch {
  console.warn("[warn] bare-server-node not installed — relay disabled.");
}

const app        = express();
const PORT       = process.env.PORT || 8080;
const BARE_PFX   = "/bare/";

// ── CORS ─────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,HEAD");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ── Serve Scramjet SW + codecs from node_modules ─────────────
app.use("/scramjet/", express.static(
  path.join(__dirname, "node_modules/@mercuryworkshop/scramjet/dist")
));

// ── Serve frontend ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// Fallback: serve index.html for all non-API/asset routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/bare/") || req.path.startsWith("/scramjet/")) return;
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Status API ─────────────────────────────────────────────────
app.get("/api/status", (_req, res) => {
  res.json({
    status:        "online",
    bare:          !!createBareServer,
    barePrefix:    BARE_PFX,
    swScope:       "/scramjet-sw/",
    time:          new Date().toISOString(),
    version:       "1.0.0",
  });
});

// ── HTTP + WebSocket server ─────────────────────────────────────
const httpServer = createServer();
const bare = createBareServer ? createBareServer(BARE_PFX) : null;

httpServer.on("request", (req, res) => {
  if (bare && bare.shouldRoute(req)) return bare.routeRequest(req, res);
  app(req, res);
});

httpServer.on("upgrade", (req, socket, head) => {
  if (bare && bare.shouldRoute(req)) return bare.routeUpgrade(req, socket, head);
  socket.end();
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║        SCRMJT Proxy — Server Online              ║
╠══════════════════════════════════════════════════╣
║  http://0.0.0.0:${String(PORT).padEnd(33)}║
║  Bare relay : ${BARE_PFX.padEnd(34)}║
║  Status API : /api/status                        ║
╚══════════════════════════════════════════════════╝
`);
});

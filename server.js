/**
 * Scramjet Proxy — Production Server
 * Deploy to Railway, Render, Fly.io, or any Node host.
 */

import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import path from "path";
import { createBareServer } from "@tomphttp/bare-server-node";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app      = express();
const PORT     = process.env.PORT || 8080;
const BARE_PFX = "/bare/";

// ── CORS ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,HEAD");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ── Serve Scramjet client bundle from node_modules ────────────
app.use("/scram/", express.static(scramjetPath));

// ── Serve frontend static files ───────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// Fallback to index.html for all non-API routes
app.get("*", (req, res) => {
  const skip = ["/api/", "/bare/", "/scram/"];
  if (skip.some(p => req.path.startsWith(p))) return;
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Status API ────────────────────────────────────────────────
app.get("/api/status", (_req, res) => {
  res.json({
    status:     "online",
    barePrefix: BARE_PFX,
    scramjet:   "/scram/",
    swScope:    "/scramjet/",
    time:       new Date().toISOString(),
    version:    "2.0.0",
  });
});

// ── HTTP + WebSocket server ───────────────────────────────────
const bare       = createBareServer(BARE_PFX);
const httpServer = createServer();

httpServer.on("request", (req, res) => {
  if (bare.shouldRoute(req)) return bare.routeRequest(req, res);
  app(req, res);
});

httpServer.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) return bare.routeUpgrade(req, socket, head);
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

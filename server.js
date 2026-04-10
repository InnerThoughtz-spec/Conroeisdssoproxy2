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

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,HEAD");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Scramjet client bundle
app.use("/scram/", express.static(scramjetPath));

// Static files from root directory (index.html lives here)
app.use(express.static(__dirname));

// Status API
app.get("/api/status", (_req, res) => {
  res.json({ status: "online", barePrefix: BARE_PFX, time: new Date().toISOString() });
});

// Bare + WS server
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
  console.log(`SCRMJT running on http://0.0.0.0:${PORT}`);
});

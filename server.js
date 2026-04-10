import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import path from "path";
import { createRequire } from "module";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);

// Resolve static dist paths directly from node_modules — no path exports needed
const scramjetPath = path.dirname(require.resolve("@mercuryworkshop/scramjet/package.json")) + "/dist";
const baremuxPath  = path.dirname(require.resolve("@mercuryworkshop/bare-mux/package.json"))  + "/dist";
const epoxyPath    = path.dirname(require.resolve("@mercuryworkshop/epoxy-transport/package.json")) + "/dist";

const app  = express();
const PORT = process.env.PORT || 8080;

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,HEAD");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Serve proxy library files
app.use("/scram/",   express.static(scramjetPath));
app.use("/baremux/", express.static(baremuxPath));
app.use("/epoxy/",   express.static(epoxyPath));

// Serve static files (index.html, sw.js) from root
app.use(express.static(__dirname));

// Status API
app.get("/api/status", (_req, res) => {
  res.json({ status: "online", time: new Date().toISOString() });
});

// HTTP + Wisp WebSocket server
const httpServer = createServer(app);

httpServer.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/wisp/")) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.end();
  }
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`SCRMJT running on http://0.0.0.0:${PORT}`);
});

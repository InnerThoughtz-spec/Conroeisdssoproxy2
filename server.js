import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import path from "path";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

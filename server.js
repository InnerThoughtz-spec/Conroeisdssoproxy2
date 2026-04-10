import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import path from "path";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Hardcode node_modules paths — no package exports needed
const nm          = path.join(__dirname, "node_modules");
const scramjetPath = path.join(nm, "@mercuryworkshop", "scramjet",        "dist");
const baremuxPath  = path.join(nm, "@mercuryworkshop", "bare-mux",         "dist");
const epoxyPath    = path.join(nm, "@mercuryworkshop", "epoxy-transport",  "dist");

const app  = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,HEAD");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use("/scram/",   express.static(scramjetPath));
app.use("/baremux/", express.static(baremuxPath));
app.use("/epoxy/",   express.static(epoxyPath));
app.use(express.static(__dirname));

app.get("/api/status", (_req, res) => {
  res.json({ status: "online", time: new Date().toISOString() });
});

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

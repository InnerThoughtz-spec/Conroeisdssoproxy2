# SCRMJT — Scramjet Proxy

A self-hosted web proxy powered by [Scramjet](https://github.com/MercuryWorkshop/scramjet) and a bare relay server.

---

## ⚡ One-Click Deploy (Free)

### Railway (recommended — instant subdomain, no sleep)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/YOUR_USERNAME/scramjet-proxy)

1. Push this folder to a **GitHub repo**
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
3. Select your repo — Railway auto-detects Node and runs `npm start`
4. Your live URL: `https://scramjet-proxy-production.up.railway.app`

> Free tier: 500 hours/month — enough for personal use.

---

### Render (free, spins down after 15min idle)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Push to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your repo — Render reads `render.yaml` automatically
4. Your live URL: `https://scramjet-proxy.onrender.com`

---

### Fly.io (free allowance, global edge)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login & deploy
fly auth login
fly launch          # auto-reads fly.toml
fly deploy
```

Your URL: `https://scramjet-proxy.fly.dev`

---

## 🐳 Docker (self-host anywhere)

```bash
docker build -t scramjet-proxy .
docker run -p 8080:8080 scramjet-proxy
# Open http://localhost:8080
```

---

## 💻 Local Development

```bash
npm install
npm start
# Open http://localhost:8080
```

---

## Project Structure

```
scramjet-proxy/
├── server.js          ← Express + bare relay server
├── public/
│   └── index.html     ← Frontend UI
├── package.json
├── Dockerfile
├── railway.toml       ← Railway config
├── render.yaml        ← Render config
└── fly.toml           ← Fly.io config
```

---

## How It Works

1. The browser loads the Scramjet **service worker** from `/scramjet/scramjet.sw.js`
2. The SW intercepts outbound requests and rewrites them
3. Rewritten requests hit the **bare relay** at `/bare/`, which fetches the target on the server side
4. The response is streamed back through the SW to the browser

> **Note:** The page must be served over HTTPS (or `localhost`) for service workers to function.

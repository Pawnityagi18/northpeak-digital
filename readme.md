# 🛍️ Razorpay AI Buildathon Demo: Agentic Commerce API & Shopping Assistant

**Track:** AI Growth & Agentic Commerce  
**Tech Stack:** Node.js, Express, Anthropic Claude API, Razorpay SDK, HTML5/Vanilla JS, Dotenv, CORS  

---

## 🌟 Overview

This project provides an **Agentic Commerce Engine** featuring:
1. **Agent-Readable Merchant Catalog (`GET /catalog`):** Exposes structured, real-time product data.
2. **Conversational AI Shopping Agent (`POST /chat`):** Multilingual/Hinglish-capable assistant powered by Anthropic Claude API.
3. **Explicit Human Confirmation Gate (`POST /checkout/confirm`):** Gated order creation requiring explicit human confirmation. The AI agent **never** confirms or triggers a payment itself.
4. **Anti-Runaway & Anti-Looping Guardrails:** Caps order creation to max 2 orders per session and 1 payment retry.
5. **Persistent Audit Trail (`GET /audit` & `GET /audit/view`):** Disk-persisted log (`audit_log.json`) with reasoning, timestamp, action type, and metadata for full explainability.

---

## 🚀 Local Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and fill in your test keys:
```bash
cp .env.example .env
```

Variables:
- `PORT`: Server port (default: `3001`)
- `RAZORPAY_KEY_ID`: Razorpay Test Key ID
- `RAZORPAY_KEY_SECRET`: Razorpay Test Key Secret
- `ANTHROPIC_API_KEY`: Anthropic Claude API Key
- `AUDIT_LOG_PATH`: Path to persistent audit log JSON file (default: `./audit_log.json`)

### 4. Running Locally
```bash
# Start production server
npm start

# Development mode
npm run dev
```

Visit [**`http://localhost:3001/`**](http://localhost:3001/) in your browser to interact with the Chat UI & Checkout demo.
Visit [**`http://localhost:3001/audit/view`**](http://localhost:3001/audit/view) to view the live Audit Trail Dashboard.

---

## ☁️ Deployment Instructions for Render.com

Follow these step-by-step instructions to deploy this application to **Render.com**:

### Step 1: Push Code to GitHub
Ensure all code and configuration files (including `render.yaml`) are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Prepare Razorpay Agentic Commerce demo for Render deployment"
git push origin main
```

### Step 2: Create a New Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service** (or **Blueprint** to auto-deploy using `render.yaml`).
3. Connect your GitHub repository (`northpeak-digital` / `razorpay-agentic-commerce`).

### Step 3: Configure Build & Runtime Settings (If creating manually)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Instance Type:** `Free` (or `Starter`)

### Step 4: Configure Environment Variables
In the Render Service Dashboard under **Environment**:
Add the following required environment variables:

| Key | Value / Description | Required? |
| :--- | :--- | :--- |
| `PORT` | `10000` (Render's default port) | Yes |
| `AUDIT_LOG_PATH` | `/var/data/audit_log.json` | Yes |
| `RAZORPAY_KEY_ID` | Your Razorpay Test Key ID (`rzp_test_...`) | Yes |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Test Key Secret | Yes |
| `ANTHROPIC_API_KEY` | Your Anthropic API Key (`sk-ant-...`) | Yes |

### Step 5: Mount Persistent Disk for Audit Logs
Under **Disks** in your Render Web Service settings:
1. Click **Add Disk**.
2. **Name:** `audit-disk`
3. **Mount Path:** `/var/data`
4. **Size:** `1 GB` (Free tier / Starter)

*(This ensures all audit logs written to `/var/data/audit_log.json` persist across server restarts and deployments.)*

### Step 6: Deploy & Verify Live Endpoints
Click **Deploy Web Service**. Once deployment succeeds, verify your live URLs:
- **Main Chat & Checkout UI:** `https://your-app-name.onrender.com/`
- **Agent-Readable Catalog:** `https://your-app-name.onrender.com/catalog`
- **Audit Log JSON:** `https://your-app-name.onrender.com/audit`
- **Audit Dashboard UI:** `https://your-app-name.onrender.com/audit/view`

---

## 📡 API Reference Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Main Chat UI & Explicit Human Gate Frontend |
| `/catalog` | `GET` | Agent-readable JSON product catalog (14 items) |
| `/chat` | `POST` | Conversational Shopping Agent (`{ message, conversation_id }`) |
| `/checkout/confirm` | `POST` | Gated Razorpay order creation (`{ conversation_id, product_id }`) |
| `/payment/verify` | `POST` | Payment status & failure handler (`{ conversation_id, order_id, status }`) |
| `/audit` | `GET` | Persistent audit log JSON (`?conversation_id=xyz`) |
| `/audit/view` | `GET` | Judge presentation visual audit trail dashboard UI |
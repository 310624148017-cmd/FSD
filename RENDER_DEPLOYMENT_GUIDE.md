# 🚀 Deploy AgriContract to Render (Step-by-Step Guide)

AgriContract (CFMS) is now configured for full deployment on [Render](https://render.com) as a unified full-stack web service (Node.js/Express backend + React Vite frontend).

---

## ⚡ Option 1: 1-Click Instant Deploy (Render Blueprint)

Click the link below to deploy directly using the repository's `render.yaml`:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/310624148017-cmd/FSD)

**Direct URL:**
```
https://render.com/deploy?repo=https://github.com/310624148017-cmd/FSD
```

1. Click **Apply Blueprint**.
2. Render will automatically detect `render.yaml` and configure:
   - **Service Type:** Web Service
   - **Runtime:** Node
   - **Build Command:** `npm run render-build`
   - **Start Command:** `npm run render-start`
   - **Health Check:** `/api/health`
3. If you have a MongoDB Atlas connection string, paste it in `MONGO_URI` (optional, can be left blank for high-speed sandbox mode).
4. Click **Apply** — your app will be live at `https://contract-farming-cfms.onrender.com`!

---

## 🛠️ Option 2: Manual Web Service Setup on Render

If you prefer to configure it manually via the Render Dashboard:

### Step 1: Create a New Web Service
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect:
   `https://github.com/310624148017-cmd/FSD`

### Step 2: Configure Service Settings
| Field | Value |
|---|---|
| **Name** | `contract-farming-cfms` (or your choice) |
| **Region** | `Oregon (US West)` or `Frankfurt (EU)` |
| **Branch** | `main` |
| **Root Directory** | *(Leave blank or enter `.`)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install && cd client && npm install --include=dev && npm run build` |
| **Start Command** | `node server/server.js` |
| **Instance Type** | `Free` |

### Step 3: Add Environment Variables
Under the **Environment Variables** section, add:
| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production mode & static assets |
| `PORT` | `10000` | Port assigned by Render |
| `JWT_SECRET` | *(Random 32-character string)* | e.g. `cfms_super_secret_jwt_2024` |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `MONGO_URI` | `mongodb+srv://<user>:<pwd>@cluster0...` | *(Optional) MongoDB Atlas Cloud Database* |

### Step 4: Health Check Path
- Scroll down to **Advanced** → **Health Check Path**.
- Enter: `/api/health`.

### Step 5: Deploy
- Click **Create Web Service**.
- Render will install dependencies, build the React frontend into `client/dist`, launch the unified Express server, and provide your live URL.

# 🌾 AgriContract — Contract Farming Management System

A full-stack **MERN** application that acts as a digital bridge between **Agribusinesses (Sponsors)** and **Farmers**, facilitating digital agreements, crop lifecycle tracking, and financial transparency.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/310624148017-cmd/FSD)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://contract-farming-lac.vercel.app)

- **Live Vercel Production:** [https://contract-farming-lac.vercel.app](https://contract-farming-lac.vercel.app)
- **1-Click Deploy to Render:** [Deploy on Render](https://render.com/deploy?repo=https://github.com/310624148017-cmd/FSD) (See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md))

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Charts | Recharts |

---

## ✨ Features

- 🔐 **Role-Based Auth** — Separate dashboards for Farmers & Agribusinesses
- 📄 **Contract Module** — Draft, publish, accept, decline, and complete contracts
- 🌱 **Crop Tracking** — Weekly crop health, yield estimate, and weather logging
- 💰 **Payment Ledger** — Track advance, milestone, and final payouts with progress bar
- 📊 **Analytics** — Yield trend chart and dashboard stats per role

---

## 📁 Project Structure

```
FSD/
├── server/          # Node.js + Express backend
│   ├── models/      # Mongoose schemas
│   ├── controllers/ # Business logic
│   ├── routes/      # API routes
│   └── middleware/  # JWT auth + role guard
└── client/          # React + Vite frontend
    └── src/
        ├── pages/   # All page components
        ├── api/     # Axios services
        └── context/ # AuthContext
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/310624148017-cmd/FSD.git
cd FSD
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in `/server`:
```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/contract-farming
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev   # Starts on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev   # Starts on http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/contracts` | Agribusiness |
| PATCH | `/api/contracts/:id/accept` | Farmer |
| POST | `/api/updates` | Farmer |
| POST | `/api/ledger` | Agribusiness |
| GET | `/api/dashboard/farmer` | Farmer |
| GET | `/api/dashboard/agribusiness` | Agribusiness |

---

## 📸 User Journey

1. **Agribusiness** registers → creates a contract with crop type, quantity, price/ton & deadline
2. **Farmer** browses open contracts → accepts one
3. **Farmer** logs weekly crop updates (health, yield estimate, weather)
4. **Agribusiness** records advance/milestone payments via ledger
5. Both parties see live payment progress and yield trend charts

---

## 👨‍💻 Built With

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

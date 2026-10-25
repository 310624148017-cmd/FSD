const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const os = require('os');
const fs = require('fs');
require('dotenv').config();

// CRITICAL FIX: Disable Mongoose command buffering so queries NEVER hang or timeout when DB is connecting
mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 1500);

// Route imports
const authRoutes = require('./routes/auth');
const contractRoutes = require('./routes/contracts');
const updateRoutes = require('./routes/updates');
const ledgerRoutes = require('./routes/ledger');
const dashboardRoutes = require('./routes/dashboard');
const aadhaarRoutes = require('./routes/aadhaar');
const uploadRoutes = require('./routes/upload');
const paymentRoutes = require('./routes/payment');

const app = express();

// ─── Database Connection Caching (for Serverless + Dev) ──────────────────────
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

app.use(async (req, res, next) => {
  if (process.env.MONGO_URI && mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.error('DB connect middleware notice:', err.message);
    }
  }
  next();
});

// ─── CORS Configuration ──────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5005',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Static Files (profile pictures safe for serverless) ─────────────────────
const uploadsPath = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// ─── State Store for Dynamic Manual Data Persistence (when MongoDB is offline) ───
const demoAgriUser = {
  _id: 'demo-agri-id-202',
  name: 'ITC Agri Ltd (Demo)',
  email: 'itc@agri.com',
  role: 'agribusiness',
  aadhaar: { verified: true, maskedNumber: 'XXXX-XXXX-9821' },
  profile: {
    companyName: 'ITC Agri Business Division',
    location: 'Hyderabad, Telangana',
    phone: '+91 98765 43210',
    cropSpecialties: ['Wheat', 'Basmati Rice', 'Cotton'],
  },
};

const demoFarmerUser = {
  _id: 'demo-farmer-id-101',
  name: 'Rajesh Kumar (Demo)',
  email: 'rajesh@farmer.com',
  role: 'farmer',
  aadhaar: { verified: true, maskedNumber: 'XXXX-XXXX-4892' },
  profile: {
    companyName: 'Kumar Organic Farms',
    location: 'Ludhiana, Punjab',
    phone: '+91 98765 12345',
    cropSpecialties: ['Wheat', 'Mustard', 'Basmati Rice'],
  },
};

let storeUsers = [demoAgriUser, demoFarmerUser];

let storeContracts = [
  {
    _id: 'c-101',
    title: 'Wheat (Sharbati A-Grade) 2024-25',
    cropType: 'Wheat',
    requiredQuantityTons: 100,
    pricePerTon: 25000,
    totalValue: 2500000,
    amountPaid: 1000000,
    paymentStatus: 'partial',
    status: 'active',
    createdAt: new Date().toISOString(),
    deadline: '2025-04-15',
    farmer: demoFarmerUser,
    agribusiness: demoAgriUser,
    terms: 'Moisture < 12%. Delivery at Ludhiana terminal. 20% advance upon signing.',
  },
  {
    _id: 'c-102',
    title: 'Basmati Rice Export Standard',
    cropType: 'Basmati Rice',
    requiredQuantityTons: 80,
    pricePerTon: 40000,
    totalValue: 3200000,
    amountPaid: 450000,
    paymentStatus: 'partial',
    status: 'accepted',
    createdAt: new Date().toISOString(),
    deadline: '2025-06-30',
    farmer: demoFarmerUser,
    agribusiness: demoAgriUser,
    terms: 'Export quality long grain specification.',
  },
  {
    _id: 'c-103',
    title: 'Organic Cotton Kharif Season',
    cropType: 'Cotton',
    requiredQuantityTons: 40,
    pricePerTon: 45000,
    totalValue: 1800000,
    amountPaid: 0,
    paymentStatus: 'pending',
    status: 'open',
    createdAt: new Date().toISOString(),
    deadline: '2025-09-10',
    farmer: null,
    agribusiness: demoAgriUser,
    terms: 'Organic certification required.',
  },
  {
    _id: 'c-104',
    title: 'Mustard Seeds Winter Harvest',
    cropType: 'Mustard',
    requiredQuantityTons: 50,
    pricePerTon: 30000,
    totalValue: 1500000,
    amountPaid: 1500000,
    paymentStatus: 'paid',
    status: 'completed',
    createdAt: new Date().toISOString(),
    deadline: '2025-03-20',
    farmer: demoFarmerUser,
    agribusiness: demoAgriUser,
    terms: 'Oil content > 38%. Fully delivered and settled.',
  },
];

let storeUpdates = [
  {
    _id: 'u-1',
    contractId: 'c-101',
    weekNumber: 2,
    cropHealth: 'good',
    weatherCondition: 'Moderate rain, good germination',
    weatherImpact: 'positive',
    estimatedYieldTons: 95,
    notes: 'Germination on 95% of sown acreage. Fertilizers applied.',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    _id: 'u-2',
    contractId: 'c-101',
    weekNumber: 4,
    cropHealth: 'excellent',
    weatherCondition: 'Sunny, 24°C',
    weatherImpact: 'positive',
    estimatedYieldTons: 98,
    notes: 'Tillering stage vigorous. No pest activity.',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    _id: 'u-3',
    contractId: 'c-101',
    weekNumber: 6,
    cropHealth: 'excellent',
    weatherCondition: 'Clear skies, mild winter',
    weatherImpact: 'positive',
    estimatedYieldTons: 102,
    notes: 'Irrigation cycle 2 completed. Projected harvest on track.',
    createdAt: new Date().toISOString(),
  },
];

let storeLedger = [
  {
    _id: 'led-1',
    contractId: 'c-101',
    contract: { title: 'Wheat (Sharbati A-Grade) 2024-25' },
    amount: 500000,
    type: 'advance',
    paymentMode: 'bank_transfer',
    transactionReference: 'NEFT-AXIS-9823412',
    notes: 'Contract signing advance 20%',
    status: 'verified',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    _id: 'led-2',
    contractId: 'c-101',
    contract: { title: 'Wheat (Sharbati A-Grade) 2024-25' },
    amount: 500000,
    type: 'milestone',
    paymentMode: 'upi',
    transactionReference: 'UPI-RAZOR-4819283',
    notes: 'Milestone 2: Tillering and fertilizer audit passed',
    status: 'verified',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    _id: 'led-3',
    contractId: 'c-102',
    contract: { title: 'Basmati Rice Export Standard' },
    amount: 450000,
    type: 'advance',
    paymentMode: 'stripe',
    transactionReference: 'STRIPE-CH-918231',
    notes: 'Seed procurement advance',
    status: 'verified',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// Helper to find current user from Authorization token header
const getUserFromHeader = (req) => {
  const auth = req.headers.authorization || '';
  if (auth.includes('farmer')) return demoFarmerUser;
  return demoAgriUser;
};

// ─── Stateful Fallback Middleware: Enables Full Manual Data Input ────────────
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next(); // Live database connected!
  }

  const { path: reqPath, method } = req;
  const currentUser = getUserFromHeader(req);

  // Health check
  if (reqPath === '/api/health') {
    return res.json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'production',
      dbConnected: false,
      timestamp: new Date().toISOString(),
    });
  }

  // ─── AUTHENTICATION ────────────────────────────────────────────────────────
  if (reqPath === '/api/auth/me' && method === 'GET') {
    return res.json({ success: true, user: currentUser });
  }

  if (reqPath === '/api/auth/me' && method === 'PUT') {
    const { name, profile } = req.body || {};
    if (name) currentUser.name = name;
    if (profile) currentUser.profile = { ...currentUser.profile, ...profile };
    return res.json({ success: true, user: currentUser });
  }

  if (reqPath === '/api/auth/login' && method === 'POST') {
    const { email } = req.body || {};
    const existing = storeUsers.find(
      (u) => u.email.toLowerCase() === (email || '').toLowerCase()
    );
    const userToReturn = existing || (email && email.toLowerCase().includes('farmer') ? demoFarmerUser : demoAgriUser);
    return res.json({
      success: true,
      token: 'demo-token-' + userToReturn.role + '-' + Date.now(),
      user: userToReturn,
    });
  }

  if (reqPath === '/api/auth/register' && method === 'POST') {
    const { name, email, role } = req.body || {};
    const newUser = {
      _id: 'user-' + Date.now(),
      name: name || 'User',
      email: email || 'user@example.com',
      role: role || 'farmer',
      aadhaar: { verified: false },
      profile: {},
    };
    storeUsers.push(newUser);
    return res.status(201).json({
      success: true,
      token: 'demo-token-' + newUser.role + '-' + Date.now(),
      user: newUser,
    });
  }

  // ─── DASHBOARDS ────────────────────────────────────────────────────────────
  if (reqPath === '/api/dashboard/agribusiness' && method === 'GET') {
    const totalPaid = storeLedger.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalContracts = storeContracts.length;
    const activeContracts = storeContracts.filter((c) => c.status === 'active').length;
    const completedContracts = storeContracts.filter((c) => c.status === 'completed').length;
    const openContracts = storeContracts.filter((c) => c.status === 'open').length;

    return res.json({
      success: true,
      dashboard: {
        stats: {
          totalContracts,
          activeContracts,
          completedContracts,
          openContracts,
          farmerCount: 4,
          totalPaid,
        },
        recentContracts: storeContracts,
      },
    });
  }

  if (reqPath === '/api/dashboard/farmer' && method === 'GET') {
    return res.json({
      success: true,
      dashboard: {
        stats: {
          totalContracts: storeContracts.filter((c) => c.farmer).length,
          activeContracts: storeContracts.filter((c) => c.status === 'active').length,
          completedContracts: storeContracts.filter((c) => c.status === 'completed').length,
          openContracts: storeContracts.filter((c) => c.status === 'open').length,
        },
        recentUpdates: storeUpdates.slice(0, 5).map((u) => ({
          ...u,
          contract: storeContracts.find((c) => c._id === u.contractId) || { title: 'Contract' },
        })),
        pendingPayments: storeContracts.slice(0, 2),
      },
    });
  }

  // ─── CONTRACTS CRUD (Add manual data, view, edit, update status) ───────────
  if (reqPath === '/api/contracts' && method === 'GET') {
    const statusQuery = req.query?.status;
    const list = statusQuery
      ? storeContracts.filter((c) => c.status === statusQuery)
      : storeContracts;
    return res.json({ success: true, contracts: list });
  }

  if (reqPath === '/api/contracts/open' && method === 'GET') {
    return res.json({
      success: true,
      contracts: storeContracts.filter((c) => c.status === 'open'),
    });
  }

  if (reqPath === '/api/contracts/my' && method === 'GET') {
    const statusQuery = req.query?.status;
    let list = storeContracts.filter((c) => Boolean(c.farmer));
    if (statusQuery) list = list.filter((c) => c.status === statusQuery);
    return res.json({ success: true, contracts: list });
  }

  // CREATE NEW CONTRACT (Manual input)
  if (reqPath === '/api/contracts' && method === 'POST') {
    const { title, cropType, requiredQuantityTons, pricePerTon, deadline, terms } = req.body || {};
    const qty = parseFloat(requiredQuantityTons) || 1;
    const price = parseFloat(pricePerTon) || 1;
    const newContract = {
      _id: 'c-' + Date.now(),
      title: title || 'Custom Agricultural Agreement',
      cropType: cropType || 'Crop',
      requiredQuantityTons: qty,
      pricePerTon: price,
      totalValue: qty * price,
      amountPaid: 0,
      paymentStatus: 'pending',
      status: 'open',
      createdAt: new Date().toISOString(),
      deadline: deadline || new Date(Date.now() + 90 * 86400000).toISOString(),
      terms: terms || 'Standard procurement specifications and SLA delivery terms.',
      farmer: null,
      agribusiness: currentUser,
    };
    storeContracts.unshift(newContract);
    return res.status(201).json({ success: true, contract: newContract });
  }

  // GET SINGLE CONTRACT
  if (reqPath.startsWith('/api/contracts/') && method === 'GET') {
    const id = reqPath.split('/')[3];
    const contract = storeContracts.find((c) => c._id === id) || storeContracts[0];
    return res.json({ success: true, contract });
  }

  // UPDATE CONTRACT
  if (reqPath.startsWith('/api/contracts/') && method === 'PUT') {
    const id = reqPath.split('/')[3];
    const contract = storeContracts.find((c) => c._id === id);
    if (contract) {
      const { title, cropType, requiredQuantityTons, pricePerTon, deadline, terms } = req.body || {};
      if (title) contract.title = title;
      if (cropType) contract.cropType = cropType;
      if (requiredQuantityTons) {
        contract.requiredQuantityTons = parseFloat(requiredQuantityTons);
        contract.totalValue = contract.requiredQuantityTons * (contract.pricePerTon || 1);
      }
      if (pricePerTon) {
        contract.pricePerTon = parseFloat(pricePerTon);
        contract.totalValue = (contract.requiredQuantityTons || 1) * contract.pricePerTon;
      }
      if (deadline) contract.deadline = deadline;
      if (terms) contract.terms = terms;
    }
    return res.json({ success: true, contract: contract || storeContracts[0] });
  }

  // ACCEPT CONTRACT
  if (reqPath.endsWith('/accept') && method === 'PATCH') {
    const id = reqPath.split('/')[3];
    const contract = storeContracts.find((c) => c._id === id);
    if (contract) {
      contract.status = 'accepted';
      contract.farmer = currentUser.role === 'farmer' ? currentUser : demoFarmerUser;
    }
    return res.json({ success: true, contract: contract || storeContracts[0] });
  }

  // COMPLETE CONTRACT
  if (reqPath.endsWith('/complete') && method === 'PATCH') {
    const id = reqPath.split('/')[3];
    const contract = storeContracts.find((c) => c._id === id);
    if (contract) contract.status = 'completed';
    return res.json({ success: true, contract: contract || storeContracts[0] });
  }

  // CANCEL CONTRACT
  if (reqPath.endsWith('/cancel') && method === 'PATCH') {
    const id = reqPath.split('/')[3];
    const contract = storeContracts.find((c) => c._id === id);
    if (contract) contract.status = 'cancelled';
    return res.json({ success: true, contract: contract || storeContracts[0] });
  }

  // DECLINE CONTRACT
  if (reqPath.endsWith('/decline') && method === 'PATCH') {
    const id = reqPath.split('/')[3];
    const contract = storeContracts.find((c) => c._id === id);
    if (contract) contract.status = 'declined';
    return res.json({ success: true, contract: contract || storeContracts[0] });
  }

  // DELETE CONTRACT
  if (reqPath.startsWith('/api/contracts/') && method === 'DELETE') {
    const id = reqPath.split('/')[3];
    storeContracts = storeContracts.filter((c) => c._id !== id);
    return res.json({ success: true, message: 'Contract deleted' });
  }

  // ─── CROP UPDATES CRUD (Log weekly manual updates) ─────────────────────────
  if (reqPath.startsWith('/api/updates/contract/') && method === 'GET') {
    const contractId = reqPath.split('/')[4];
    const updates = storeUpdates.filter((u) => u.contractId === contractId);
    return res.json({ success: true, updates });
  }

  // POST NEW CROP UPDATE
  if (reqPath === '/api/updates' && method === 'POST') {
    const {
      contractId,
      weekNumber,
      cropHealth,
      estimatedYieldTons,
      weatherCondition,
      weatherImpact,
      notes,
    } = req.body || {};

    const newUpdate = {
      _id: 'u-' + Date.now(),
      contractId: contractId || 'c-101',
      weekNumber: parseInt(weekNumber) || 1,
      cropHealth: cropHealth || 'good',
      estimatedYieldTons: parseFloat(estimatedYieldTons) || 0,
      weatherCondition: weatherCondition || 'Clear skies',
      weatherImpact: weatherImpact || 'neutral',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };
    storeUpdates.unshift(newUpdate);

    // Automatically transition contract to 'active' cultivation
    const contract = storeContracts.find((c) => c._id === contractId);
    if (contract && contract.status === 'accepted') {
      contract.status = 'active';
    }

    return res.status(201).json({ success: true, update: newUpdate });
  }

  // ─── LEDGER & PAYMENTS (Record manual disbursements) ───────────────────────
  if (reqPath === '/api/ledger' && method === 'GET') {
    return res.json({ success: true, payments: storeLedger });
  }

  if (reqPath.startsWith('/api/ledger/contract/') && method === 'GET') {
    const contractId = reqPath.split('/')[4];
    const entries = storeLedger.filter((e) => e.contractId === contractId);
    return res.json({ success: true, entries });
  }

  if (reqPath.startsWith('/api/ledger/summary/') && method === 'GET') {
    const contractId = reqPath.split('/')[4];
    const contract = storeContracts.find((c) => c._id === contractId);
    const contractEntries = storeLedger.filter((e) => e.contractId === contractId);

    const totalPaid = contractEntries.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalContractValue = contract?.totalValue || 2500000;
    const remainingBalance = Math.max(0, totalContractValue - totalPaid);
    const percentagePaid = totalContractValue > 0 ? Math.round((totalPaid / totalContractValue) * 100) : 0;

    return res.json({
      success: true,
      summary: {
        totalPaid,
        totalContractValue,
        remainingBalance,
        percentagePaid,
        advancePaid: contractEntries.filter((x) => x.type === 'advance').reduce((a, b) => a + (b.amount || 0), 0),
        milestonePaid: contractEntries.filter((x) => x.type === 'milestone').reduce((a, b) => a + (b.amount || 0), 0),
        finalPaid: contractEntries.filter((x) => x.type === 'final').reduce((a, b) => a + (b.amount || 0), 0),
        entryCount: contractEntries.length,
      },
    });
  }

  // RECORD PAYMENT (Manual input)
  if (reqPath === '/api/ledger' && method === 'POST') {
    const { contractId, amount, type, paymentMode, transactionReference, notes } = req.body || {};
    const amt = parseFloat(amount) || 0;
    const contract = storeContracts.find((c) => c._id === contractId);

    const newPayment = {
      _id: 'led-' + Date.now(),
      contractId: contractId || 'c-101',
      contract: { title: contract?.title || 'Contract Agreement' },
      amount: amt,
      type: type || 'advance',
      paymentMode: paymentMode || 'bank_transfer',
      transactionReference: transactionReference || 'REF-' + Math.floor(Math.random() * 899999 + 100000),
      notes: notes || 'Manual payment disbursement',
      status: 'verified',
      createdAt: new Date().toISOString(),
    };
    storeLedger.unshift(newPayment);

    // Update contract's amountPaid and paymentStatus
    if (contract) {
      contract.amountPaid = (contract.amountPaid || 0) + amt;
      contract.paymentStatus = contract.amountPaid >= contract.totalValue ? 'paid' : 'partial';
    }

    return res.status(201).json({ success: true, entry: newPayment });
  }

  // ─── AADHAAR VERIFICATION ──────────────────────────────────────────────────
  if (reqPath === '/api/aadhaar/send-otp' && method === 'POST') {
    const { aadhaarNumber } = req.body || {};
    const masked = `XXXX-XXXX-${(aadhaarNumber || '4892').slice(-4)}`;
    return res.json({
      success: true,
      maskedNumber: masked,
      demoOtp: '123456',
    });
  }

  if (reqPath === '/api/aadhaar/verify-otp' && method === 'POST') {
    currentUser.aadhaar = {
      verified: true,
      maskedNumber: currentUser.aadhaar?.maskedNumber || 'XXXX-XXXX-4892',
      verifiedAt: new Date().toISOString(),
    };
    return res.json({
      success: true,
      message: 'Aadhaar successfully verified in sandbox mode!',
      aadhaar: currentUser.aadhaar,
    });
  }

  next();
});

// ─── Live Routes (Executed when MongoDB is connected) ─────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/aadhaar', aadhaarRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
  });
});

// ─── Serve Built Frontend in Production (Render / Unified Node Host) ───────────
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    // Only intercept HTML navigation, do not intercept API or upload calls
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // ─── Root Route ──────────────────────────────────────────────────────────────
  app.get('/', (req, res) => {
    res.json({
      message: 'AgriContract API is running',
      docs: '/api/health',
    });
  });
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
module.exports.connectDB = connectDB;

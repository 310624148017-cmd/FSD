import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute, PublicRoute } from './routes/Guards';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AgribusinessContractsPage, { OpenContractsPage, FarmerContractsPage } from './pages/ContractsPage';
import ContractFormPage from './pages/ContractFormPage';
import ContractDetailPage from './pages/ContractDetailPage';
import CropUpdateFormPage from './pages/CropUpdateFormPage';
import LedgerPage from './pages/LedgerPage';
import ProfilePage from './pages/ProfilePage';
import AadhaarVerifyPage from './pages/AadhaarVerifyPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected — any authenticated role */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/verify-aadhaar" element={<ProtectedRoute><AadhaarVerifyPage /></ProtectedRoute>} />
          <Route path="/contracts/:id" element={<ProtectedRoute><ContractDetailPage /></ProtectedRoute>} />
          <Route path="/ledger" element={<ProtectedRoute><LedgerPage /></ProtectedRoute>} />
          <Route path="/ledger/:contractId" element={<ProtectedRoute><LedgerPage /></ProtectedRoute>} />

          {/* Agribusiness only */}
          <Route path="/contracts" element={<RoleRoute role="agribusiness"><AgribusinessContractsPage /></RoleRoute>} />
          <Route path="/contracts/new" element={<RoleRoute role="agribusiness"><ContractFormPage /></RoleRoute>} />
          <Route path="/contracts/:id/edit" element={<RoleRoute role="agribusiness"><ContractFormPage isEdit /></RoleRoute>} />

          {/* Farmer only */}
          <Route path="/contracts/open" element={<RoleRoute role="farmer"><OpenContractsPage /></RoleRoute>} />
          <Route path="/contracts/my" element={<RoleRoute role="farmer"><FarmerContractsPage /></RoleRoute>} />
          <Route path="/updates/new/:contractId" element={<RoleRoute role="farmer"><CropUpdateFormPage /></RoleRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

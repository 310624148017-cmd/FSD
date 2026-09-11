import api from './axios';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
};

export const contractService = {
  create: (data) => api.post('/contracts', data),
  getMyContracts: (params) => api.get('/contracts', { params }),
  getOpenContracts: () => api.get('/contracts/open'),
  getFarmerContracts: (params) => api.get('/contracts/my', { params }),
  getById: (id) => api.get(`/contracts/${id}`),
  update: (id, data) => api.put(`/contracts/${id}`, data),
  accept: (id) => api.patch(`/contracts/${id}/accept`),
  decline: (id) => api.patch(`/contracts/${id}/decline`),
  cancel: (id) => api.patch(`/contracts/${id}/cancel`),
  complete: (id) => api.patch(`/contracts/${id}/complete`),
  delete: (id) => api.delete(`/contracts/${id}`),
};

export const updateService = {
  create: (data) => api.post('/updates', data),
  getByContract: (contractId) => api.get(`/updates/contract/${contractId}`),
  getById: (id) => api.get(`/updates/${id}`),
  edit: (id, data) => api.put(`/updates/${id}`, data),
  delete: (id) => api.delete(`/updates/${id}`),
};

export const ledgerService = {
  record: (data) => api.post('/ledger', data),
  getByContract: (contractId) => api.get(`/ledger/contract/${contractId}`),
  getSummary: (contractId) => api.get(`/ledger/summary/${contractId}`),
  getAll: () => api.get('/ledger'),
  updateStatus: (id, status) => api.patch(`/ledger/${id}/status`, { status }),
};

export const dashboardService = {
  farmer: () => api.get('/dashboard/farmer'),
  agribusiness: () => api.get('/dashboard/agribusiness'),
};

export const aadhaarService = {
  getStatus: () => api.get('/aadhaar/status'),
  sendOtp: (aadhaarNumber) => api.post('/aadhaar/send-otp', { aadhaarNumber }),
  verifyOtp: (otp) => api.post('/aadhaar/verify-otp', { otp }),
};

export const uploadService = {
  uploadProfilePicture: (formData) =>
    api.post('/upload/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteProfilePicture: () => api.delete('/upload/profile-picture'),
};


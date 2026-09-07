const Contract = require('../models/Contract');

// @route  POST /api/contracts
// @access Agribusiness
const createContract = async (req, res) => {
  try {
    const { title, cropType, requiredQuantityTons, pricePerTon, deadline, terms } = req.body;
    const contract = await Contract.create({
      title,
      cropType,
      requiredQuantityTons,
      pricePerTon,
      deadline,
      terms,
      agribusiness: req.user._id,
    });
    res.status(201).json({ success: true, contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/contracts
// @access Agribusiness (own contracts)
const getAgribusinessContracts = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { agribusiness: req.user._id };
    if (status) filter.status = status;

    const contracts = await Contract.find(filter)
      .populate('farmer', 'name email profile.location')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: contracts.length, contracts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/contracts/open
// @access Farmer (browse open contracts)
const getOpenContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ status: 'open' })
      .populate('agribusiness', 'name email profile.companyName profile.location')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: contracts.length, contracts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/contracts/my
// @access Farmer (own assigned contracts)
const getFarmerContracts = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { farmer: req.user._id };
    if (status) filter.status = status;

    const contracts = await Contract.find(filter)
      .populate('agribusiness', 'name email profile.companyName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: contracts.length, contracts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/contracts/:id
// @access Private (any authenticated)
const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('agribusiness', 'name email profile')
      .populate('farmer', 'name email profile');

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found.' });
    }

    res.json({ success: true, contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/contracts/:id
// @access Agribusiness (owner, status=open only)
const updateContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });

    if (contract.agribusiness.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (contract.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Can only edit open contracts.' });
    }

    const { title, cropType, requiredQuantityTons, pricePerTon, deadline, terms } = req.body;
    Object.assign(contract, { title, cropType, requiredQuantityTons, pricePerTon, deadline, terms });
    await contract.save();

    res.json({ success: true, contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PATCH /api/contracts/:id/accept
// @access Farmer
const acceptContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });
    if (contract.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Contract is no longer open.' });
    }

    contract.farmer = req.user._id;
    contract.status = 'accepted';
    await contract.save();

    res.json({ success: true, message: 'Contract accepted.', contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PATCH /api/contracts/:id/decline
// @access Farmer
const declineContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });
    if (contract.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Contract is not open.' });
    }

    contract.status = 'declined';
    await contract.save();

    res.json({ success: true, message: 'Contract declined.', contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PATCH /api/contracts/:id/cancel
// @access Agribusiness (owner)
const cancelContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });
    if (contract.agribusiness.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (!['open', 'accepted'].includes(contract.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel at this stage.' });
    }

    contract.status = 'cancelled';
    await contract.save();

    res.json({ success: true, message: 'Contract cancelled.', contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PATCH /api/contracts/:id/complete
// @access Agribusiness (owner)
const completeContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });
    if (contract.agribusiness.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (!['accepted', 'active'].includes(contract.status)) {
      return res.status(400).json({ success: false, message: 'Contract must be accepted or active.' });
    }

    contract.status = 'completed';
    await contract.save();

    res.json({ success: true, message: 'Contract marked as completed.', contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/contracts/:id
// @access Agribusiness (owner, open only)
const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });
    if (contract.agribusiness.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (contract.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Can only delete open contracts.' });
    }

    await contract.deleteOne();
    res.json({ success: true, message: 'Contract deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createContract,
  getAgribusinessContracts,
  getOpenContracts,
  getFarmerContracts,
  getContractById,
  updateContract,
  acceptContract,
  declineContract,
  cancelContract,
  completeContract,
  deleteContract,
};

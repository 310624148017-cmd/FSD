const CropUpdate = require('../models/CropUpdate');
const Contract = require('../models/Contract');

// @route  POST /api/updates
// @access Farmer
const createUpdate = async (req, res) => {
  try {
    const { contractId, weekNumber, cropHealth, estimatedYieldTons, weatherCondition, weatherImpact, notes, images } =
      req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found.' });
    if (contract.farmer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not the assigned farmer.' });
    }

    // Promote to active when first update is logged
    if (contract.status === 'accepted') {
      contract.status = 'active';
      await contract.save();
    }

    const update = await CropUpdate.create({
      contract: contractId,
      farmer: req.user._id,
      weekNumber,
      cropHealth,
      estimatedYieldTons,
      weatherCondition,
      weatherImpact,
      notes,
      images: images || [],
    });

    res.status(201).json({ success: true, update });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/updates/contract/:contractId
// @access Private (any authenticated)
const getUpdatesByContract = async (req, res) => {
  try {
    const updates = await CropUpdate.find({ contract: req.params.contractId })
      .populate('farmer', 'name email')
      .sort({ weekNumber: 1 });

    res.json({ success: true, count: updates.length, updates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/updates/:id
// @access Private
const getUpdateById = async (req, res) => {
  try {
    const update = await CropUpdate.findById(req.params.id)
      .populate('farmer', 'name email')
      .populate('contract', 'title cropType');

    if (!update) return res.status(404).json({ success: false, message: 'Update not found.' });
    res.json({ success: true, update });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/updates/:id
// @access Farmer (owner)
const editUpdate = async (req, res) => {
  try {
    const update = await CropUpdate.findById(req.params.id);
    if (!update) return res.status(404).json({ success: false, message: 'Update not found.' });
    if (update.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const fields = ['cropHealth', 'estimatedYieldTons', 'weatherCondition', 'weatherImpact', 'notes', 'images'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) update[f] = req.body[f];
    });
    await update.save();

    res.json({ success: true, update });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/updates/:id
// @access Farmer (owner)
const deleteUpdate = async (req, res) => {
  try {
    const update = await CropUpdate.findById(req.params.id);
    if (!update) return res.status(404).json({ success: false, message: 'Update not found.' });
    if (update.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await update.deleteOne();
    res.json({ success: true, message: 'Update deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createUpdate, getUpdatesByContract, getUpdateById, editUpdate, deleteUpdate };

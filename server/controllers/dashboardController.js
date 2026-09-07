const Contract = require('../models/Contract');
const CropUpdate = require('../models/CropUpdate');
const LedgerEntry = require('../models/LedgerEntry');

// @route  GET /api/dashboard/farmer
// @access Farmer
const farmerDashboard = async (req, res) => {
  try {
    const farmerId = req.user._id;

    const [activeContracts, completedContracts, totalContracts, recentUpdates, pendingPayments] = await Promise.all([
      Contract.countDocuments({ farmer: farmerId, status: { $in: ['accepted', 'active'] } }),
      Contract.countDocuments({ farmer: farmerId, status: 'completed' }),
      Contract.countDocuments({ farmer: farmerId }),
      CropUpdate.find({ farmer: farmerId }).sort({ createdAt: -1 }).limit(5).populate('contract', 'title cropType'),
      Contract.find({ farmer: farmerId, paymentStatus: { $in: ['pending', 'partial'] } })
        .select('title totalValue amountPaid paymentStatus')
        .limit(5),
    ]);

    const openContracts = await Contract.countDocuments({ status: 'open' });

    res.json({
      success: true,
      dashboard: {
        stats: { activeContracts, completedContracts, totalContracts, openContracts },
        recentUpdates,
        pendingPayments,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/dashboard/agribusiness
// @access Agribusiness
const agribusinessDashboard = async (req, res) => {
  try {
    const agriId = req.user._id;

    const [totalContracts, activeContracts, completedContracts, openContracts] = await Promise.all([
      Contract.countDocuments({ agribusiness: agriId }),
      Contract.countDocuments({ agribusiness: agriId, status: { $in: ['accepted', 'active'] } }),
      Contract.countDocuments({ agribusiness: agriId, status: 'completed' }),
      Contract.countDocuments({ agribusiness: agriId, status: 'open' }),
    ]);

    // Total payout aggregation
    const payoutAgg = await LedgerEntry.aggregate([
      { $match: { agribusiness: agriId } },
      { $group: { _id: null, totalPaid: { $sum: '$amount' } } },
    ]);
    const totalPaid = payoutAgg.length > 0 ? payoutAgg[0].totalPaid : 0;

    // Unique farmers
    const uniqueFarmers = await Contract.distinct('farmer', {
      agribusiness: agriId,
      farmer: { $ne: null },
    });

    // Recent contracts
    const recentContracts = await Contract.find({ agribusiness: agriId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('farmer', 'name email');

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalContracts,
          activeContracts,
          completedContracts,
          openContracts,
          totalPaid,
          farmerCount: uniqueFarmers.length,
        },
        recentContracts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { farmerDashboard, agribusinessDashboard };

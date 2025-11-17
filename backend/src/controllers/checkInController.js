const CheckIn = require('../models/CheckIn');
const User = require('../models/User');
const alertService = require('../services/alertService');
const emailService = require('../services/emailService');
const pushService = require('../services/pushService');
const logger = require('../utils/logger');

/**
 * @desc    Create check-in
 * @route   POST /api/checkins
 * @access  Private
 */
exports.createCheckIn = async (req, res, next) => {
  try {
    const { location, notes, mood } = req.body;

    // Create check-in
    const checkIn = await CheckIn.create({
      user: req.user.id,
      location,
      notes,
      mood,
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip
    });

    // Update user's last check-in time
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        lastCheckIn: checkIn.timestamp,
        $inc: { checkInStreak: 1 }
      },
      { new: true }
    );

    // Resolve any active alerts
    await alertService.resolveUserAlerts(req.user.id);

    // Send confirmation (optional)
    if (user.fcmToken) {
      await pushService.sendCheckInNotification(user.fcmToken, user);
    }

    logger.info(`Check-in created for user: ${user.email}`);

    res.status(201).json({
      success: true,
      data: checkIn
    });
  } catch (error) {
    logger.error('CreateCheckIn error:', error);
    next(error);
  }
};

/**
 * @desc    Get all check-ins for logged in user
 * @route   GET /api/checkins
 * @access  Private
 */
exports.getCheckIns = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate
    } = req.query;

    const query = { user: req.user.id };

    // Add date filters if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const checkIns = await CheckIn.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await CheckIn.countDocuments(query);

    res.status(200).json({
      success: true,
      count: checkIns.length,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: checkIns
    });
  } catch (error) {
    logger.error('GetCheckIns error:', error);
    next(error);
  }
};

/**
 * @desc    Get single check-in
 * @route   GET /api/checkins/:id
 * @access  Private
 */
exports.getCheckIn = async (req, res, next) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id);

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        error: 'Check-in no encontrado'
      });
    }

    // Make sure user owns check-in
    if (checkIn.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    res.status(200).json({
      success: true,
      data: checkIn
    });
  } catch (error) {
    logger.error('GetCheckIn error:', error);
    next(error);
  }
};

/**
 * @desc    Get check-in statistics
 * @route   GET /api/checkins/stats
 * @access  Private
 */
exports.getCheckInStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const stats = await CheckIn.getUserStats(req.user.id, parseInt(days));

    // Get streak
    const user = await User.findById(req.user.id);

    // Get alert status
    const alertStatus = user.getAlertStatus();

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        streak: user.checkInStreak,
        lastCheckIn: user.lastCheckIn,
        alertStatus: alertStatus
      }
    });
  } catch (error) {
    logger.error('GetCheckInStats error:', error);
    next(error);
  }
};

/**
 * @desc    Delete check-in
 * @route   DELETE /api/checkins/:id
 * @access  Private
 */
exports.deleteCheckIn = async (req, res, next) => {
  try {
    const checkIn = await CheckIn.findById(req.params.id);

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        error: 'Check-in no encontrado'
      });
    }

    // Make sure user owns check-in
    if (checkIn.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    await checkIn.deleteOne();

    logger.info(`Check-in deleted: ${req.params.id}`);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('DeleteCheckIn error:', error);
    next(error);
  }
};

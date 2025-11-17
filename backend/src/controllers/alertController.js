const Alert = require('../models/Alert');
const alertService = require('../services/alertService');
const logger = require('../utils/logger');

/**
 * @desc    Get all alerts for logged in user
 * @route   GET /api/alerts
 * @access  Private
 */
exports.getAlerts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      level
    } = req.query;

    const query = { user: req.user.id };

    if (status) query.status = status;
    if (level) query.level = level;

    const alerts = await Alert.find(query)
      .populate('notificationsSent.contact', 'name email phone relation')
      .sort({ triggeredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Alert.countDocuments(query);

    res.status(200).json({
      success: true,
      count: alerts.length,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: alerts
    });
  } catch (error) {
    logger.error('GetAlerts error:', error);
    next(error);
  }
};

/**
 * @desc    Get active alerts for logged in user
 * @route   GET /api/alerts/active
 * @access  Private
 */
exports.getActiveAlerts = async (req, res, next) => {
  try {
    const alerts = await alertService.getActiveAlerts(req.user.id);

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    logger.error('GetActiveAlerts error:', error);
    next(error);
  }
};

/**
 * @desc    Get alert statistics
 * @route   GET /api/alerts/stats
 * @access  Private
 */
exports.getAlertStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const stats = await alertService.getAlertStats(req.user.id, parseInt(days));

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('GetAlertStats error:', error);
    next(error);
  }
};

/**
 * @desc    Get single alert
 * @route   GET /api/alerts/:id
 * @access  Private
 */
exports.getAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('notificationsSent.contact', 'name email phone relation');

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alerta no encontrada'
      });
    }

    // Make sure user owns alert
    if (alert.user._id.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error('GetAlert error:', error);
    next(error);
  }
};

/**
 * @desc    Manually resolve an alert
 * @route   PUT /api/alerts/:id/resolve
 * @access  Private
 */
exports.resolveAlert = async (req, res, next) => {
  try {
    const result = await alertService.manualResolveAlert(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: result.alert
    });
  } catch (error) {
    logger.error('ResolveAlert error:', error);
    next(error);
  }
};

/**
 * @desc    Trigger manual alert check (admin/testing)
 * @route   POST /api/alerts/check
 * @access  Private
 */
exports.triggerAlertCheck = async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.user.id);
    const triggered = await alertService.checkUserAlerts(user);

    res.status(200).json({
      success: true,
      alertTriggered: triggered,
      message: triggered ? 'Alerta activada' : 'No se requiere alerta'
    });
  } catch (error) {
    logger.error('TriggerAlertCheck error:', error);
    next(error);
  }
};

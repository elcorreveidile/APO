const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAlerts,
  getActiveAlerts,
  getAlertStats,
  getAlert,
  resolveAlert,
  triggerAlertCheck
} = require('../controllers/alertController');

router.use(protect); // All routes are protected

router.route('/')
  .get(getAlerts);

router.route('/active')
  .get(getActiveAlerts);

router.route('/stats')
  .get(getAlertStats);

router.route('/check')
  .post(triggerAlertCheck);

router.route('/:id')
  .get(getAlert);

router.route('/:id/resolve')
  .put(resolveAlert);

module.exports = router;

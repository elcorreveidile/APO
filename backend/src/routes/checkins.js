const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createCheckIn,
  getCheckIns,
  getCheckIn,
  getCheckInStats,
  deleteCheckIn
} = require('../controllers/checkInController');

router.use(protect); // All routes are protected

router.route('/')
  .get(getCheckIns)
  .post(createCheckIn);

router.route('/stats')
  .get(getCheckInStats);

router.route('/:id')
  .get(getCheckIn)
  .delete(deleteCheckIn);

module.exports = router;

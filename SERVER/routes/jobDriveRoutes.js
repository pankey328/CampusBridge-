const express = require('express');
const router = express.Router();
const JobDrive = require('../models/JobDrive');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Get active job drives
router.get('/active', protect, authorizeRoles('STUDENT'), async (req, res) => {
  try {
    const drives = await JobDrive.find({ status: 'ACTIVE' }).select('_id title description');
    res.json(drives);
  } catch (err) {
    console.error('Error fetching active job drives:', err);
    res.status(500).json({ message: 'Failed to fetch job drives.' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const mockController = require('../controllers/mockController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Start new mock interview session
router.post('/start', protect, authorizeRoles('STUDENT'), mockController.startMock);

// Submit answer / finish interview
router.post('/answer', protect, authorizeRoles('STUDENT'), mockController.submitAnswer);

// Get aggregate mock stats per student (TPO/SUPERADMIN)
router.get('/stats', protect, authorizeRoles('SUPERADMIN', 'TPO'), mockController.getStats);

// Get detailed mock attempts for specific student (TPO/SUPERADMIN)
router.get('/attempts/:studentId', protect, authorizeRoles('SUPERADMIN', 'TPO'), mockController.getDetails);

// Get students own mock attempts (STUDENT)
router.get('/my-attempts', protect, authorizeRoles('STUDENT'), (req, res, next) => {
  req.params.studentId = req.user.id;
  next();
}, mockController.getDetails);

module.exports = router;

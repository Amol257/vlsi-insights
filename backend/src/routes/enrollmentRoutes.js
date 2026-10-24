const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/', enrollmentController.submitEnrollmentHandler);
router.get('/verify-lab-access', requireAuth, enrollmentController.verifyLabAccessHandler);

module.exports = router;


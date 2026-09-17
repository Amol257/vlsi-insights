const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

router.post('/', enrollmentController.submitEnrollmentHandler);

module.exports = router;

const express = require('express');
const ggSheetController = require('../controllers/ggSheetController');
const router = express.Router();

router.get('/', ggSheetController.getFbSheetReport);

module.exports = router;

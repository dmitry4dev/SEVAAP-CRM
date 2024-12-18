const express = require('express');
const ggSheetController = require('../controllers/ggSheetController');
const router = express.Router();

router.get('/', ggSheetController.getCrosgifSheetReport);

module.exports = router;

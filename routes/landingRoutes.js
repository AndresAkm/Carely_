const express = require('express');
const router = express.Router();
const { getLanding, getCatalog } = require('../controllers/landingController');

router.get('/', getLanding);
router.get('/catalogo', getCatalog);

module.exports = router;
